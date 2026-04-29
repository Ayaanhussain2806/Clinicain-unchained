import Razorpay from "razorpay";
import { createHmac } from "crypto";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Fixed consultation fee in paise (convert from rupees)
export const CONSULTATION_FEE_RUPEES = 500; // ₹500
export const CONSULTATION_FEE_PAISE = CONSULTATION_FEE_RUPEES * 100; // 50000 paise

/**
 * Create a Razorpay order for appointment payment
 */
export async function createRazorpayOrder(appointmentId: number, email: string, phone: string) {
  try {
    const order = await razorpay.orders.create({
      amount: CONSULTATION_FEE_PAISE, // Amount in paise
      currency: "INR",
      receipt: `appointment_${appointmentId}_${Date.now()}`,
      notes: {
        appointmentId: appointmentId.toString(),
      },
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

/**
 * Verify payment signature from Razorpay webhook/client
 * This ensures the payment was authorized by Razorpay
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    // Create the expected signature
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    // Compare signatures (timing-safe comparison recommended, but using simple for clarity)
    return expectedSignature === signature;
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    return false;
  }
}

/**
 * Fetch payment details from Razorpay
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.order_id,
        status: payment.status, // captured, authorized, failed, etc.
        amount: payment.amount,
        currency: payment.currency,
        method: payment.method,
        email: payment.email,
        phone: payment.contact,
      },
    };
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch payment details",
    };
  }
}
