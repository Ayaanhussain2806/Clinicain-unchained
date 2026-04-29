# Razorpay Integration - Quick Start Guide

## Step-by-Step Setup

### 1️⃣ Get Razorpay Credentials
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up or log in
3. Navigate to **Settings → API Keys**
4. Copy your **Key ID** and **Key Secret** (for test mode first)

### 2️⃣ Backend Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cd artifacts/api-server
   cp .env.example .env
   ```

2. Update `.env` with your Razorpay credentials:
   ```bash
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx_secret
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

### 3️⃣ Frontend Configuration
1. Frontend is already configured - Razorpay script loads from CDN
2. Install frontend dependencies:
   ```bash
   cd artifacts/clinicians-unchained
   pnpm install
   ```

### 4️⃣ Run the Application

**Terminal 1 - Backend:**
```bash
cd artifacts/api-server
pnpm run dev
```

**Terminal 2 - Frontend:**
```bash
cd artifacts/clinicians-unchained
pnpm run dev
```

### 5️⃣ Test the Payment Flow

1. **Create an Appointment:**
   - Navigate to Appointments page
   - Click "Book Appointment"
   - Fill in doctor, date, and time
   - Submit

2. **Initiate Payment:**
   - See the new appointment in the list
   - Click "Pay & Confirm" button
   - Modal appears with payment details

3. **Complete Payment:**
   - Razorpay checkout opens
   - Use test card: **4111 1111 1111 1111**
   - Expiry: **12/25**
   - CVV: **123**
   - Enter any email/phone

4. **Verify Success:**
   - Appointment status changes to "Confirmed"
   - Payment status shows "Paid"
   - Confirmation email sent

## Key Features Implemented

✅ **Database Schema** - Added payment fields to appointments table
✅ **Payment Initiation** - Create Razorpay orders
✅ **Signature Verification** - HMAC-SHA256 verification
✅ **Frontend Integration** - Razorpay checkout modal
✅ **Payment Status Tracking** - Display payment status
✅ **Email Notifications** - Confirmation emails sent
✅ **Error Handling** - Graceful error messages
✅ **Webhook Support** - Optional webhook handler (optional)

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/appointments/:id/initiate-payment` | POST | Create Razorpay order |
| `/api/appointments/:id/verify-payment` | POST | Verify payment signature |
| `/api/appointments/:id/payment-status` | GET | Check payment status |
| `/api/webhooks/razorpay` | POST | Receive Razorpay webhooks (optional) |

## Environment Variables

```bash
# Required
RAZORPAY_KEY_ID=           # Your Razorpay Key ID
RAZORPAY_KEY_SECRET=       # Your Razorpay Key Secret

# Optional (for webhooks)
RAZORPAY_WEBHOOK_SECRET=   # Webhook secret from Razorpay dashboard
```

## Important: Production Checklist

Before going live:

- [ ] Switch to **Live Mode** credentials in Razorpay dashboard
- [ ] Update `.env` with production credentials
- [ ] Enable HTTPS (required by Razorpay)
- [ ] Configure webhook URL in Razorpay dashboard
- [ ] Change consultation fee if needed (currently ₹500)
- [ ] Set up email templates for payment confirmations
- [ ] Test with real payment details in production
- [ ] Enable logging for payment events
- [ ] Set up monitoring/alerts for failed payments
- [ ] Review security best practices in guide

## Customization

### Change Consultation Fee
File: `artifacts/api-server/src/lib/paymentService.ts`
```typescript
export const CONSULTATION_FEE_RUPEES = 500; // Change to your amount
```

### Customize Checkout UI
File: `artifacts/clinicians-unchained/src/lib/paymentUtils.ts`
```typescript
// Modify the razorpayOptions object to customize:
// - color (theme)
// - prefilled data
// - checkout options
```

### Update Email Template
File: `artifacts/api-server/src/lib/emailService.ts`
- Add payment confirmation message
- Include receipt details
- Add payment ID for reference

## Troubleshooting

### "RAZORPAY_KEY_ID is not set"
- Check `.env` file exists in `artifacts/api-server/`
- Verify all required variables are set
- Restart backend server

### "Payment signature verification failed"
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check order ID and payment ID match
- Ensure signature is properly formatted

### Razorpay checkout not opening
- Check browser console for errors
- Verify Razorpay script loads: `window.Razorpay`
- Try in incognito mode (cache issue)
- Check CORS settings

### Payment successful but appointment not updating
- Check backend logs for SQL errors
- Verify database connection
- Ensure appointment exists with correct ID

## Resources

- 📚 [Full Integration Guide](./RAZORPAY_INTEGRATION_GUIDE.md)
- 🔗 [Razorpay Docs](https://razorpay.com/docs/)
- 🧪 [Test Cards](https://razorpay.com/docs/payments/test-account/test-cards/)
- 💬 [Razorpay Support](https://razorpay.com/support/)

## Support

For issues or questions:
1. Check the full integration guide
2. Review Razorpay documentation
3. Check backend logs: `artifacts/api-server/dist/index.mjs`
4. Verify browser console for frontend errors
5. Contact Razorpay support with error details

---

**Happy coding! 🚀**
