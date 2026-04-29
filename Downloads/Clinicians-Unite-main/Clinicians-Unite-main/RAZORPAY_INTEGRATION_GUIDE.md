# Razorpay Payment Integration Guide

## Overview
This guide explains the complete Razorpay payment gateway integration for the appointment booking system.

## Architecture

### Database Schema Updates
The `appointments` table now includes payment-related fields:
- `razorpayOrderId` - Razorpay order ID
- `razorpayPaymentId` - Razorpay payment ID  
- `consultationFee` - Fee amount in paise (1 paise = 0.01 INR)
- `paymentStatus` - Status: pending, completed, failed
- `paymentVerificationSignature` - Payment signature for verification

### Backend Endpoints

#### 1. Initiate Payment
**Endpoint:** `POST /api/appointments/:id/initiate-payment`

Creates a Razorpay order when user proceeds to payment.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_xxxxx",
  "amount": 50000,
  "currency": "INR",
  "keyId": "rzp_live_xxxxx"
}
```

#### 2. Verify Payment
**Endpoint:** `POST /api/appointments/:id/verify-payment`

Verifies the payment signature after successful payment.

**Request Body:**
```json
{
  "razorpayOrderId": "order_xxxxx",
  "razorpayPaymentId": "pay_xxxxx",
  "razorpaySignature": "signature_hash"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified and appointment confirmed",
  "appointment": {
    "id": 1,
    "status": "confirmed",
    "paymentStatus": "completed",
    "razorpayPaymentId": "pay_xxxxx"
  }
}
```

#### 3. Get Payment Status
**Endpoint:** `GET /api/appointments/:id/payment-status`

Retrieves current payment status of an appointment.

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": 1,
    "status": "confirmed",
    "paymentStatus": "completed",
    "consultationFee": 50000,
    "razorpayOrderId": "order_xxxxx",
    "razorpayPaymentId": "pay_xxxxx"
  }
}
```

## Frontend Payment Flow

### Components

#### 1. Payment Utils (`lib/paymentUtils.ts`)
- `openRazorpayCheckout()` - Opens Razorpay checkout modal
- Handles payment success/failure callbacks
- Manages Razorpay script initialization

#### 2. Appointments Page (`pages/appointments.tsx`)
- `handleInitiatePayment()` - Initiates payment flow
- `handlePaymentSuccess()` - Handles successful payment
- `handlePaymentFailure()` - Handles payment failure
- Displays payment status in table

### User Flow
1. User clicks "Pay & Confirm" button for pending appointment
2. Frontend calls `/api/appointments/:id/initiate-payment`
3. Backend creates Razorpay order
4. Razorpay checkout opens with payment details
5. User completes payment
6. Frontend receives payment confirmation
7. Frontend calls `/api/appointments/:id/verify-payment`
8. Backend verifies signature and updates appointment status
9. User sees appointment as "Confirmed" with "Paid" status

## Configuration

### Environment Variables
Add these to your `.env` file:

```bash
# Razorpay credentials
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx_secret_key
```

Get these from: https://dashboard.razorpay.com/app/keys

### Consultation Fee
Currently set to **₹500** (50000 paise)

Location: `artifacts/api-server/src/lib/paymentService.ts`
```typescript
export const CONSULTATION_FEE_RUPEES = 500; // Change this value
export const CONSULTATION_FEE_PAISE = CONSULTATION_FEE_RUPEES * 100;
```

## Installation & Setup

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd artifacts/api-server
   pnpm install
   ```

2. **Update environment variables:**
   - Create/update `.env` file with Razorpay credentials

3. **Run database migration (optional - only if using migration system):**
   ```bash
   # Add migration for new payment fields if using migrations
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd artifacts/clinicians-unchained
   pnpm install
   ```

2. **Razorpay script** is automatically loaded from CDN in `index.html`

## Security Considerations

### Signature Verification
- All payments are verified using HMAC-SHA256
- Backend validates the signature before confirming payment
- Uses Razorpay's key secret for verification
- **Never expose your key secret on the frontend**

### Best Practices
1. ✅ Always verify payment signature on backend
2. ✅ Use HTTPS in production
3. ✅ Store sensitive keys in environment variables
4. ✅ Never hardcode API credentials
5. ✅ Log payment events for audit trail
6. ✅ Implement idempotency to handle retries

## Testing

### Test Credentials
Use Razorpay's test cards (in test mode):

**Successful Payment:**
- Card: 4111 1111 1111 1111
- Expiry: 12/25
- CVV: 123

**Failed Payment:**
- Card: 4222 2222 2222 2026
- Expiry: 12/25
- CVV: 123

### Testing Steps
1. Switch Razorpay dashboard to test mode
2. Update `.env` with test credentials
3. Create an appointment
4. Click "Pay & Confirm"
5. Use test card details
6. Verify payment status in appointment list

## Troubleshooting

### Issue: "Razorpay not available"
- **Solution:** Ensure Razorpay script loaded in `index.html`
- Check browser console for CORS errors

### Issue: "Signature verification failed"
- **Solution:** Verify `RAZORPAY_KEY_SECRET` is correct
- Check order ID and payment ID match

### Issue: Payment successful but appointment not updated
- **Solution:** Check backend logs for verification errors
- Ensure database connection is working
- Verify appointment exists

### Issue: Webhook not received
- **Solution:** Configure webhook URL in Razorpay dashboard
- Ensure backend is publicly accessible
- Add webhook endpoint: `POST /api/webhooks/razorpay`

## Email Notifications

The system sends confirmation emails after successful payment:
- Contains appointment details
- Includes doctor information
- Confirms payment status

Update email templates in `artifacts/api-server/src/lib/emailService.ts` to include payment details.

## Future Enhancements

1. **Webhooks** - Handle Razorpay webhooks for real-time updates
2. **Refunds** - Implement refund functionality
3. **Recurring Payments** - Support for subscription-based appointments
4. **Multiple Payment Methods** - Add UPI, wallet options
5. **Analytics** - Payment dashboard and reporting
6. **Partial Payments** - Insurance coverage integration

## Useful Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Orders API](https://razorpay.com/docs/api/orders/)
- [Payment Verification](https://razorpay.com/docs/payment-gateway/payments/validate-payments/)
- [Test Cards](https://razorpay.com/docs/payments/test-account/test-cards/)
