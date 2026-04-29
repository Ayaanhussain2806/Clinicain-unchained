import { Router, type IRouter } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { db, bookingsTable, paymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function getRazorpay() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

router.post("/payments/create-order", requireAuth, async (req, res): Promise<void> => {
  const { bookingId, amount } = req.body;
  if (!bookingId || !amount) {
    res.status(400).json({ error: "bookingId and amount are required" });
    return;
  }

  const userId = req.user!.userId;

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, bookingId));
  if (!booking || booking.userId !== userId) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const razorpay = getRazorpay();
  const amountInPaise = Math.round(amount * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `booking_${bookingId}`,
    notes: { bookingId: String(bookingId), userId: String(userId) },
  });

  await db.insert(paymentsTable).values({
    userId,
    bookingId,
    razorpayOrderId: order.id,
    amount,
    currency: "INR",
    status: "created",
  });

  req.log.info({ orderId: order.id, bookingId }, "Razorpay order created");

  res.json({
    orderId: order.id,
    amount: amountInPaise,
    currency: "INR",
    keyId: process.env["RAZORPAY_KEY_ID"],
  });
});

router.post("/payments/verify", requireAuth, async (req, res): Promise<void> => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    res.status(400).json({ error: "Missing payment verification fields" });
    return;
  }

  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keySecret) {
    res.status(500).json({ error: "Razorpay not configured" });
    return;
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex");

  if (expectedSignature !== razorpaySignature) {
    res.status(400).json({ error: "Payment verification failed: invalid signature" });
    return;
  }

  await db.update(paymentsTable)
    .set({ razorpayPaymentId, razorpaySignature, status: "paid" })
    .where(eq(paymentsTable.razorpayOrderId, razorpayOrderId));

  if (bookingId) {
    await db.update(bookingsTable)
      .set({ status: "active" })
      .where(eq(bookingsTable.id, bookingId));
  }

  req.log.info({ razorpayPaymentId, razorpayOrderId }, "Payment verified");
  res.json({ success: true, paymentId: razorpayPaymentId });
});

router.get("/payments/history", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const payments = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.userId, userId))
    .orderBy(paymentsTable.createdAt);

  res.json(payments.map((p) => ({
    id: p.id,
    bookingId: p.bookingId,
    razorpayOrderId: p.razorpayOrderId,
    razorpayPaymentId: p.razorpayPaymentId,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  })));
});

export default router;
