import { Router, type IRouter } from "express";
import { db, bookingsTable, parkingLotsTable, parkingSlotsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateBookingBody, GetBookingParams, CancelBookingParams, CheckinBookingParams, CheckoutBookingParams, ListBookingsQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { computePricingFactors, computeCurrentRate, estimateTotal } from "../lib/pricing";
import { generateBookingQr } from "../lib/qrcode";

const router: IRouter = Router();

async function formatBooking(booking: typeof bookingsTable.$inferSelect, withQr = false) {
  const [lot] = await db.select({ name: parkingLotsTable.name }).from(parkingLotsTable).where(eq(parkingLotsTable.id, booking.lotId));
  const [slot] = await db.select({ slotNumber: parkingSlotsTable.slotNumber }).from(parkingSlotsTable).where(eq(parkingSlotsTable.id, booking.slotId));

  const base = {
    id: booking.id,
    userId: booking.userId,
    lotId: booking.lotId,
    slotId: booking.slotId,
    lotName: lot?.name ?? "Unknown",
    slotNumber: slot?.slotNumber ?? "N/A",
    vehicleType: booking.vehicleType,
    vehiclePlate: booking.vehiclePlate,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    bookingType: booking.bookingType,
    status: booking.status,
    totalAmount: booking.totalAmount,
    checkedInAt: booking.checkedInAt?.toISOString() ?? null,
    checkedOutAt: booking.checkedOutAt?.toISOString() ?? null,
    createdAt: booking.createdAt.toISOString(),
  };

  if (withQr) {
    return { ...base, qrCode: booking.qrCode ?? "" };
  }
  return base;
}

router.get("/bookings", requireAuth, async (req, res): Promise<void> => {
  const params = ListBookingsQueryParams.safeParse(req.query);
  const userId = req.user!.userId;

  let query = db.select().from(bookingsTable).where(eq(bookingsTable.userId, userId));
  const bookings = await db.select().from(bookingsTable)
    .where(
      params.success && params.data.status
        ? and(eq(bookingsTable.userId, userId), eq(bookingsTable.status, params.data.status))
        : eq(bookingsTable.userId, userId)
    )
    .orderBy(desc(bookingsTable.createdAt));

  const formatted = await Promise.all(bookings.map((b) => formatBooking(b)));
  res.json(formatted);
});

router.post("/bookings", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lotId, slotId: requestedSlotId, vehicleType, vehiclePlate, startTime, endTime, bookingType } = parsed.data;
  const userId = req.user!.userId;

  const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, lotId));
  if (!lot) {
    res.status(400).json({ error: "Parking lot not found" });
    return;
  }

  let slot;
  if (requestedSlotId) {
    const [requested] = await db.select().from(parkingSlotsTable)
      .where(and(eq(parkingSlotsTable.id, requestedSlotId), eq(parkingSlotsTable.status, "available")));
    if (!requested) {
      res.status(409).json({ error: "Requested slot is no longer available" });
      return;
    }
    slot = requested;
  } else {
    const available = await db.select().from(parkingSlotsTable)
      .where(and(
        eq(parkingSlotsTable.lotId, lotId),
        eq(parkingSlotsTable.status, "available"),
        eq(parkingSlotsTable.type, vehicleType === "motorcycle" ? "motorcycle" : vehicleType === "ev" ? "ev" : "standard")
      ))
      .limit(1);

    if (available.length === 0) {
      const anyAvailable = await db.select().from(parkingSlotsTable)
        .where(and(eq(parkingSlotsTable.lotId, lotId), eq(parkingSlotsTable.status, "available")))
        .limit(1);
      if (anyAvailable.length === 0) {
        res.status(409).json({ error: "No available slots in this lot" });
        return;
      }
      slot = anyAvailable[0];
    } else {
      slot = available[0];
    }
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  const currentSlots = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lotId));
  const occupiedCount = currentSlots.filter((s) => s.status !== "available").length;
  const factors = computePricingFactors(occupiedCount, lot.totalSlots);
  const ratePerHour = computeCurrentRate(lot.baseRatePerHour, factors);
  const totalAmount = estimateTotal(ratePerHour, durationHours);

  await db.update(parkingSlotsTable).set({ status: "reserved" }).where(eq(parkingSlotsTable.id, slot.id));

  const [booking] = await db.insert(bookingsTable).values({
    userId,
    lotId,
    slotId: slot.id,
    vehicleType,
    vehiclePlate,
    startTime: start,
    endTime: end,
    bookingType,
    status: "active",
    totalAmount,
    qrCode: null,
  }).returning();

  const qrCode = await generateBookingQr({
    bookingId: booking.id,
    lotName: lot.name,
    slotNumber: slot.slotNumber,
    vehiclePlate,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  });

  const [updated] = await db.update(bookingsTable).set({ qrCode }).where(eq(bookingsTable.id, booking.id)).returning();

  req.log.info({ bookingId: booking.id, userId }, "Booking created");

  const [lotInfo] = await db.select({ name: parkingLotsTable.name }).from(parkingLotsTable).where(eq(parkingLotsTable.id, lotId));
  res.status(201).json({
    id: updated.id,
    userId: updated.userId,
    lotId: updated.lotId,
    slotId: updated.slotId,
    lotName: lotInfo?.name ?? lot.name,
    slotNumber: slot.slotNumber,
    vehicleType: updated.vehicleType,
    vehiclePlate: updated.vehiclePlate,
    startTime: updated.startTime.toISOString(),
    endTime: updated.endTime.toISOString(),
    bookingType: updated.bookingType,
    status: updated.status,
    totalAmount: updated.totalAmount,
    checkedInAt: null,
    checkedOutAt: null,
    qrCode: updated.qrCode ?? "",
    createdAt: updated.createdAt.toISOString(),
  });
});

router.get("/bookings/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetBookingParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  if (!booking || booking.userId !== req.user!.userId) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const formatted = await formatBooking(booking, true);
  res.json(formatted);
});

router.post("/bookings/:id/cancel", requireAuth, async (req, res): Promise<void> => {
  const params = CancelBookingParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  if (!booking || booking.userId !== req.user!.userId) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (booking.status !== "active") {
    res.status(400).json({ error: "Only active bookings can be cancelled" });
    return;
  }

  const [updated] = await db.update(bookingsTable).set({ status: "cancelled" }).where(eq(bookingsTable.id, booking.id)).returning();
  await db.update(parkingSlotsTable).set({ status: "available" }).where(eq(parkingSlotsTable.id, booking.slotId));

  req.log.info({ bookingId: booking.id }, "Booking cancelled");
  const formatted = await formatBooking(updated);
  res.json(formatted);
});

router.post("/bookings/:id/checkin", requireAuth, async (req, res): Promise<void> => {
  const params = CheckinBookingParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  if (!booking || booking.userId !== req.user!.userId) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (booking.status !== "active" || booking.checkedInAt) {
    res.status(400).json({ error: "Cannot check in at this time" });
    return;
  }

  const [updated] = await db.update(bookingsTable).set({ checkedInAt: new Date() }).where(eq(bookingsTable.id, booking.id)).returning();
  await db.update(parkingSlotsTable).set({ status: "occupied" }).where(eq(parkingSlotsTable.id, booking.slotId));

  req.log.info({ bookingId: booking.id }, "Checked in");
  const formatted = await formatBooking(updated);
  res.json(formatted);
});

router.post("/bookings/:id/checkout", requireAuth, async (req, res): Promise<void> => {
  const params = CheckoutBookingParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  if (!booking || booking.userId !== req.user!.userId) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (!booking.checkedInAt || booking.checkedOutAt) {
    res.status(400).json({ error: "Must be checked in first" });
    return;
  }

  const [updated] = await db.update(bookingsTable).set({ checkedOutAt: new Date(), status: "completed" }).where(eq(bookingsTable.id, booking.id)).returning();
  await db.update(parkingSlotsTable).set({ status: "available" }).where(eq(parkingSlotsTable.id, booking.slotId));

  req.log.info({ bookingId: booking.id }, "Checked out");
  const formatted = await formatBooking(updated);
  res.json(formatted);
});

export default router;
