import { Router, type IRouter } from "express";
import { db, ridesTable, parkingLotsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { BookRideBody, GetRideParams, CancelRideParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { estimateRideFare } from "../lib/pricing";

const router: IRouter = Router();

const DRIVER_NAMES = ["Rajesh Kumar", "Priya Sharma", "Amit Singh", "Deepak Gupta", "Sana Khan"];
const DRIVER_PHONES = ["+91-98765-00001", "+91-98765-00002", "+91-98765-00003", "+91-98765-00004", "+91-98765-00005"];
const VEHICLE_NUMBERS = ["DL 01 AB 1234", "MH 12 CD 5678", "KA 03 EF 9012", "TN 07 GH 3456", "UP 32 IJ 7890"];

async function formatRide(ride: typeof ridesTable.$inferSelect) {
  const [lot] = await db.select({ name: parkingLotsTable.name }).from(parkingLotsTable).where(eq(parkingLotsTable.id, ride.pickupLotId));

  return {
    id: ride.id,
    userId: ride.userId,
    pickupLotId: ride.pickupLotId,
    pickupLotName: lot?.name ?? "Unknown",
    destination: ride.destination,
    rideType: ride.rideType,
    status: ride.status,
    driverName: ride.driverName ?? null,
    driverPhone: ride.driverPhone ?? null,
    vehicleNumber: ride.vehicleNumber ?? null,
    estimatedArrivalMinutes: ride.estimatedArrivalMinutes ?? null,
    estimatedFare: ride.estimatedFare,
    isPooled: ride.isPooled,
    scheduledTime: ride.scheduledTime?.toISOString() ?? null,
    createdAt: ride.createdAt.toISOString(),
  };
}

router.get("/rides", requireAuth, async (req, res): Promise<void> => {
  const rides = await db.select().from(ridesTable).where(eq(ridesTable.userId, req.user!.userId));
  const formatted = await Promise.all(rides.map(formatRide));
  res.json(formatted);
});

router.post("/rides", requireAuth, async (req, res): Promise<void> => {
  const parsed = BookRideBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { pickupLotId, destination, rideType, scheduledTime, isPooled } = parsed.data;
  const userId = req.user!.userId;

  const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, pickupLotId));
  if (!lot) {
    res.status(400).json({ error: "Pickup lot not found" });
    return;
  }

  const estimatedFare = estimateRideFare(rideType, destination.length, isPooled ?? false);
  const estimatedArrivalMinutes = Math.floor(Math.random() * 10) + 3;
  const driverIdx = Math.floor(Math.random() * DRIVER_NAMES.length);

  const [ride] = await db.insert(ridesTable).values({
    userId,
    pickupLotId,
    destination,
    rideType,
    status: "confirmed",
    driverName: DRIVER_NAMES[driverIdx],
    driverPhone: DRIVER_PHONES[driverIdx],
    vehicleNumber: VEHICLE_NUMBERS[driverIdx],
    estimatedArrivalMinutes,
    estimatedFare,
    isPooled: isPooled ?? false,
    scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
  }).returning();

  req.log.info({ rideId: ride.id, userId }, "Ride booked");
  const formatted = await formatRide(ride);
  res.status(201).json(formatted);
});

router.get("/rides/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetRideParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [ride] = await db.select().from(ridesTable).where(eq(ridesTable.id, params.data.id));
  if (!ride || ride.userId !== req.user!.userId) {
    res.status(404).json({ error: "Ride not found" });
    return;
  }

  const formatted = await formatRide(ride);
  res.json(formatted);
});

router.post("/rides/:id/cancel", requireAuth, async (req, res): Promise<void> => {
  const params = CancelRideParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [ride] = await db.select().from(ridesTable).where(eq(ridesTable.id, params.data.id));
  if (!ride || ride.userId !== req.user!.userId) {
    res.status(404).json({ error: "Ride not found" });
    return;
  }

  if (!["requested", "confirmed"].includes(ride.status)) {
    res.status(400).json({ error: "Cannot cancel ride at this stage" });
    return;
  }

  const [updated] = await db.update(ridesTable).set({ status: "cancelled" }).where(eq(ridesTable.id, ride.id)).returning();
  req.log.info({ rideId: ride.id }, "Ride cancelled");
  const formatted = await formatRide(updated);
  res.json(formatted);
});

export default router;
