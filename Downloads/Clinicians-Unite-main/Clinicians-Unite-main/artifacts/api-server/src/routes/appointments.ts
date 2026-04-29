import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, appointmentsTable, patientsTable, doctorsTable, prescriptionsTable } from "@workspace/db";
import { CreateAppointmentBody, ConfirmAppointmentParams } from "@workspace/api-zod";
import { sendAppointmentConfirmationEmail } from "../lib/emailService";
import { createRazorpayOrder, verifyPaymentSignature, CONSULTATION_FEE_PAISE } from "../lib/paymentService";

const router: IRouter = Router();

router.get("/appointments", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: appointmentsTable.id,
      patientId: appointmentsTable.patientId,
      doctorId: appointmentsTable.doctorId,
      prescriptionId: appointmentsTable.prescriptionId,
      insurancePlanId: appointmentsTable.insurancePlanId,
      status: appointmentsTable.status,
      scheduledAt: appointmentsTable.scheduledAt,
      createdAt: appointmentsTable.createdAt,
      patientName: patientsTable.name,
      doctorName: doctorsTable.name,
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .orderBy(desc(appointmentsTable.scheduledAt));

  res.json(rows);
});

router.post("/appointments", async (req, res): Promise<void> => {
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [appointment] = await db
    .insert(appointmentsTable)
    .values({
      patientId: parsed.data.patientId,
      doctorId: parsed.data.doctorId,
      prescriptionId: parsed.data.prescriptionId ?? null,
      insurancePlanId: parsed.data.insurancePlanId ?? null,
      scheduledAt: new Date(parsed.data.scheduledAt),
      status: "pending",
    })
    .returning();

  const [full] = await db
    .select({
      id: appointmentsTable.id,
      patientId: appointmentsTable.patientId,
      doctorId: appointmentsTable.doctorId,
      prescriptionId: appointmentsTable.prescriptionId,
      insurancePlanId: appointmentsTable.insurancePlanId,
      status: appointmentsTable.status,
      scheduledAt: appointmentsTable.scheduledAt,
      createdAt: appointmentsTable.createdAt,
      patientName: patientsTable.name,
      doctorName: doctorsTable.name,
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .leftJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .where(eq(appointmentsTable.id, appointment.id));

  res.status(201).json(full);
});

router.post("/appointments/:id/confirm", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ConfirmAppointmentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const [updated] = await db
    .update(appointmentsTable)
    .set({ status: "confirmed" })
    .where(eq(appointmentsTable.id, params.data.id))
    .returning();

  // Fetch related data for email
  const [patient] = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.id, existing.patientId));

  const [doctor] = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.id, existing.doctorId));

  let prescriptionDrug: string | null = null;
  let prescriptionReason: string | null = null;
  if (existing.prescriptionId) {
    const [prescription] = await db
      .select()
      .from(prescriptionsTable)
      .where(eq(prescriptionsTable.id, existing.prescriptionId));
    prescriptionDrug = prescription?.drug ?? null;
    prescriptionReason = prescription?.reason ?? null;
  }

  // Send confirmation email (non-blocking — don't fail if email fails)
  if (patient && doctor) {
    sendAppointmentConfirmationEmail({
      patientName: patient.name,
      patientEmail: patient.email,
      doctorName: doctor.name,
      scheduledAt: updated.scheduledAt,
      prescriptionDrug,
      prescriptionReason,
    }).catch((err) => {
      req.log.error({ err }, "Failed to send appointment confirmation email");
    });
  }

  res.json({
    ...updated,
    patientName: patient?.name ?? null,
    doctorName: doctor?.name ?? null,
  });
});

/**
 * POST /api/appointments/:id/initiate-payment
 * Initiates payment by creating a Razorpay order
 * Body: { email: string, phone: string }
 */
router.post("/appointments/:id/initiate-payment", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const appointmentId = parseInt(raw, 10);

    if (Number.isNaN(appointmentId)) {
      res.status(400).json({ error: "Invalid appointment ID" });
      return;
    }

    const { email, phone } = req.body;
    if (!email || !phone) {
      res.status(400).json({ error: "Email and phone are required" });
      return;
    }

    // Check if appointment exists
    const [appointment] = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, appointmentId));

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    // If already paid, return existing order
    if (appointment.paymentStatus === "completed") {
      res.status(400).json({ error: "Appointment already paid" });
      return;
    }

    // Create Razorpay order
    const orderResult = await createRazorpayOrder(appointmentId, email, phone);

    if (!orderResult.success) {
      res.status(500).json({ error: orderResult.error });
      return;
    }

    // Update appointment with Razorpay order ID
    await db
      .update(appointmentsTable)
      .set({ razorpayOrderId: orderResult.orderId, consultationFee: CONSULTATION_FEE_PAISE })
      .where(eq(appointmentsTable.id, appointmentId));

    res.json({
      success: true,
      orderId: orderResult.orderId,
      amount: orderResult.amount,
      currency: orderResult.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    req.log.error({ error }, "Error initiating payment");
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

/**
 * POST /api/appointments/:id/verify-payment
 * Verifies the payment signature and updates appointment status
 * Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
router.post("/appointments/:id/verify-payment", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const appointmentId = parseInt(raw, 10);

    if (Number.isNaN(appointmentId)) {
      res.status(400).json({ error: "Invalid appointment ID" });
      return;
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({ error: "Missing payment details" });
      return;
    }

    // Verify signature
    const isSignatureValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isSignatureValid) {
      // Update appointment with failed payment status
      await db
        .update(appointmentsTable)
        .set({ paymentStatus: "failed" })
        .where(eq(appointmentsTable.id, appointmentId));

      res.status(400).json({ error: "Payment signature verification failed" });
      return;
    }

    // Signature is valid, update appointment to "paid" status
    const [updated] = await db
      .update(appointmentsTable)
      .set({
        status: "confirmed",
        paymentStatus: "completed",
        razorpayPaymentId,
        razorpayOrderId,
        paymentVerificationSignature: razorpaySignature,
      })
      .where(eq(appointmentsTable.id, appointmentId))
      .returning();

    // Fetch related patient and doctor info
    const [patient] = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.id, updated.patientId));

    const [doctor] = await db
      .select()
      .from(doctorsTable)
      .where(eq(doctorsTable.id, updated.doctorId));

    // Send payment confirmation email (non-blocking)
    if (patient && doctor) {
      sendAppointmentConfirmationEmail({
        patientName: patient.name,
        patientEmail: patient.email,
        doctorName: doctor.name,
        scheduledAt: updated.scheduledAt,
        isPaid: true,
      }).catch((err) => {
        req.log.error({ err }, "Failed to send payment confirmation email");
      });
    }

    res.json({
      success: true,
      message: "Payment verified and appointment confirmed",
      appointment: {
        id: updated.id,
        status: updated.status,
        paymentStatus: updated.paymentStatus,
        razorpayPaymentId: updated.razorpayPaymentId,
      },
    });
  } catch (error) {
    req.log.error({ error }, "Error verifying payment");
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

/**
 * GET /api/appointments/:id/payment-status
 * Get payment status of an appointment
 */
router.get("/appointments/:id/payment-status", async (req, res): Promise<void> => {
  try {
    const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const appointmentId = parseInt(raw, 10);

    if (Number.isNaN(appointmentId)) {
      res.status(400).json({ error: "Invalid appointment ID" });
      return;
    }

    const [appointment] = await db
      .select({
        id: appointmentsTable.id,
        status: appointmentsTable.status,
        paymentStatus: appointmentsTable.paymentStatus,
        consultationFee: appointmentsTable.consultationFee,
        razorpayOrderId: appointmentsTable.razorpayOrderId,
        razorpayPaymentId: appointmentsTable.razorpayPaymentId,
      })
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, appointmentId));

    if (!appointment) {
      res.status(404).json({ error: "Appointment not found" });
      return;
    }

    res.json({
      success: true,
      payment: appointment,
    });
  } catch (error) {
    req.log.error({ error }, "Error fetching payment status");
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
});

export default router;
