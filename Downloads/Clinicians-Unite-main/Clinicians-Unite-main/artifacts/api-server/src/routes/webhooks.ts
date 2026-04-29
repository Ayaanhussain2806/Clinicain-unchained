/**
 * Razorpay Webhook Handler (Optional - for production)
 * 
 * This handler processes webhooks from Razorpay for payment updates
 * Configure the webhook URL in Razorpay dashboard: https://dashboard.razorpay.com/app/webhooks
 * 
 * Webhook events to enable:
 * - payment.authorized
 * - payment.failed
 * - order.paid
 */

import { Router, type IRouter, Request, Response } from "express";
import { createHmac } from "crypto";
import { eq } from "drizzle-orm";
import { db, appointmentsTable } from "@workspace/db";

const router: IRouter = Router();

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * POST /api/webhooks/razorpay
 * Receives payment webhooks from Razorpay
 */
router.post("/webhooks/razorpay", async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!webhookSecret) {
      req.log.warn("Webhook secret not configured");
      res.status(400).json({ error: "Webhook not configured" });
      return;
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      JSON.stringify(req.body),
      signature,
      webhookSecret
    );

    if (!isValid) {
      req.log.error("Invalid webhook signature");
      res.status(400).json({ error: "Invalid signature" });
      return;
    }

    const event = req.body.event;
    const data = req.body.payload;

    req.log.info({ event, data }, "Received Razorpay webhook");

    // Handle different webhook events
    switch (event) {
      case "payment.authorized":
        await handlePaymentAuthorized(data, req);
        break;

      case "payment.failed":
        await handlePaymentFailed(data, req);
        break;

      case "order.paid":
        await handleOrderPaid(data, req);
        break;

      default:
        req.log.warn({ event }, "Unknown webhook event");
    }

    // Always respond with 200 to acknowledge receipt
    res.json({ status: "ok" });
  } catch (error) {
    req.log.error({ error }, "Error processing webhook");
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

/**
 * Handle payment.authorized event
 */
async function handlePaymentAuthorized(data: any, req: Request): Promise<void> {
  try {
    const payment = data.payment;
    const orderId = payment.order_id;

    // Find appointment by order ID
    const [appointment] = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.razorpayOrderId, orderId));

    if (!appointment) {
      req.log.warn({ orderId }, "Appointment not found for order");
      return;
    }

    // Update appointment with payment details
    await db
      .update(appointmentsTable)
      .set({
        razorpayPaymentId: payment.id,
        paymentStatus: "completed",
      })
      .where(eq(appointmentsTable.id, appointment.id));

    req.log.info({ appointmentId: appointment.id, paymentId: payment.id }, "Payment authorized");
  } catch (error) {
    req.log.error({ error }, "Error handling payment authorized");
  }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(data: any, req: Request): Promise<void> {
  try {
    const payment = data.payment;
    const orderId = payment.order_id;

    // Find appointment by order ID
    const [appointment] = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.razorpayOrderId, orderId));

    if (!appointment) {
      req.log.warn({ orderId }, "Appointment not found for order");
      return;
    }

    // Update appointment with failed status
    await db
      .update(appointmentsTable)
      .set({
        razorpayPaymentId: payment.id,
        paymentStatus: "failed",
      })
      .where(eq(appointmentsTable.id, appointment.id));

    req.log.info(
      { appointmentId: appointment.id, reason: payment.reason },
      "Payment failed"
    );
  } catch (error) {
    req.log.error({ error }, "Error handling payment failed");
  }
}

/**
 * Handle order.paid event
 */
async function handleOrderPaid(data: any, req: Request): Promise<void> {
  try {
    const order = data.order;
    const orderId = order.id;

    // Find appointment by order ID
    const [appointment] = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.razorpayOrderId, orderId));

    if (!appointment) {
      req.log.warn({ orderId }, "Appointment not found for order");
      return;
    }

    // Update appointment status to confirmed if not already
    if (appointment.status !== "confirmed") {
      await db
        .update(appointmentsTable)
        .set({
          status: "confirmed",
          paymentStatus: "completed",
        })
        .where(eq(appointmentsTable.id, appointment.id));
    }

    req.log.info({ appointmentId: appointment.id }, "Order marked as paid");
  } catch (error) {
    req.log.error({ error }, "Error handling order paid");
  }
}

export default router;
