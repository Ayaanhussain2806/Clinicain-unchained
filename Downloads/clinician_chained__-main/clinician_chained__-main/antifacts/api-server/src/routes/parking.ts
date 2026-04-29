import { Router, type IRouter } from "express";
import { db, parkingLotsTable, parkingSlotsTable, bookingsTable } from "@workspace/db";
import { eq, and, ne } from "drizzle-orm";
import { GetParkingLotParams, GetLotAvailabilityParams } from "@workspace/api-zod";
import { computePricingFactors, computeCurrentRate } from "../lib/pricing";

const router: IRouter = Router();

router.get("/parking/lots", async (_req, res): Promise<void> => {
  const lots = await db.select().from(parkingLotsTable).orderBy(parkingLotsTable.id);

  const lotsWithAvailability = await Promise.all(lots.map(async (lot) => {
    const slots = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lot.id));
    const availableSlots = slots.filter((s) => s.status === "available").length;

    const factors = computePricingFactors(lot.totalSlots - availableSlots, lot.totalSlots);
    const currentRate = computeCurrentRate(lot.baseRatePerHour, factors);

    return {
      id: lot.id,
      name: lot.name,
      address: lot.address,
      city: lot.city,
      latitude: lot.latitude,
      longitude: lot.longitude,
      totalSlots: lot.totalSlots,
      availableSlots,
      baseRatePerHour: currentRate,
      amenities: (lot.amenities as string[]) ?? [],
      imageUrl: lot.imageUrl ?? null,
      rating: lot.rating,
    };
  }));

  res.json(lotsWithAvailability);
});

router.get("/parking/lots/:id", async (req, res): Promise<void> => {
  const params = GetParkingLotParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, params.data.id));
  if (!lot) {
    res.status(404).json({ error: "Parking lot not found" });
    return;
  }

  const slots = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lot.id));
  const availableSlots = slots.filter((s) => s.status === "available").length;

  const factors = computePricingFactors(lot.totalSlots - availableSlots, lot.totalSlots);
  const currentRate = computeCurrentRate(lot.baseRatePerHour, factors);

  res.json({
    id: lot.id,
    name: lot.name,
    address: lot.address,
    city: lot.city,
    latitude: lot.latitude,
    longitude: lot.longitude,
    totalSlots: lot.totalSlots,
    availableSlots,
    baseRatePerHour: currentRate,
    amenities: (lot.amenities as string[]) ?? [],
    imageUrl: lot.imageUrl ?? null,
    rating: lot.rating,
    slots: slots.map((s) => ({
      id: s.id,
      slotNumber: s.slotNumber,
      floor: s.floor,
      type: s.type,
      status: s.status,
    })),
  });
});

router.get("/parking/lots/:id/availability", async (req, res): Promise<void> => {
  const params = GetLotAvailabilityParams.safeParse({ id: parseInt(req.params.id as string, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, params.data.id));
  if (!lot) {
    res.status(404).json({ error: "Parking lot not found" });
    return;
  }

  const slots = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lot.id));
  const availableSlots = slots.filter((s) => s.status === "available").length;
  const occupancyPercent = lot.totalSlots > 0 ? ((lot.totalSlots - availableSlots) / lot.totalSlots) * 100 : 0;

  const byType: Record<string, number> = {};
  slots.forEach((s) => {
    if (s.status === "available") {
      byType[s.type] = (byType[s.type] ?? 0) + 1;
    }
  });

  res.json({
    lotId: lot.id,
    totalSlots: lot.totalSlots,
    availableSlots,
    occupancyPercent: parseFloat(occupancyPercent.toFixed(1)),
    byType,
    updatedAt: new Date().toISOString(),
  });
});

export default router;
