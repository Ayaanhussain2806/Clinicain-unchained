import { Router, type IRouter } from "express";
import { db, parkingLotsTable, parkingSlotsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetPricingEstimateQueryParams } from "@workspace/api-zod";
import { computePricingFactors, computeCurrentRate, estimateTotal, classifyTier } from "../lib/pricing";

const router: IRouter = Router();

router.get("/pricing/estimate", async (req, res): Promise<void> => {
  const params = GetPricingEstimateQueryParams.safeParse({
    lotId: parseInt(req.query.lotId as string, 10),
    durationHours: parseFloat(req.query.durationHours as string),
    vehicleType: req.query.vehicleType ?? "car",
  });

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { lotId, durationHours, vehicleType } = params.data;

  const [lot] = await db.select().from(parkingLotsTable).where(eq(parkingLotsTable.id, lotId));
  if (!lot) {
    res.status(400).json({ error: "Parking lot not found" });
    return;
  }

  const slots = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lotId));
  const occupiedCount = slots.filter((s) => s.status !== "available").length;
  const factors = computePricingFactors(occupiedCount, lot.totalSlots);
  const ratePerHour = computeCurrentRate(lot.baseRatePerHour, factors);
  const estimatedTotal = estimateTotal(ratePerHour, durationHours);

  const combined = factors.timeMultiplier * factors.occupancyMultiplier * factors.demandMultiplier;

  res.json({
    lotId: lot.id,
    lotName: lot.name,
    durationHours,
    vehicleType,
    baseRate: lot.baseRatePerHour,
    demandMultiplier: factors.demandMultiplier,
    timeMultiplier: factors.timeMultiplier,
    occupancyMultiplier: factors.occupancyMultiplier,
    estimatedTotal,
    pricingTier: factors.pricingTier,
  });
});

router.get("/pricing/current", async (_req, res): Promise<void> => {
  const lots = await db.select().from(parkingLotsTable).orderBy(parkingLotsTable.id);

  const pricing = await Promise.all(lots.map(async (lot) => {
    const slots = await db.select().from(parkingSlotsTable).where(eq(parkingSlotsTable.lotId, lot.id));
    const occupiedCount = slots.filter((s) => s.status !== "available").length;
    const factors = computePricingFactors(occupiedCount, lot.totalSlots);
    const currentRate = computeCurrentRate(lot.baseRatePerHour, factors);
    const combined = factors.timeMultiplier * factors.occupancyMultiplier * factors.demandMultiplier;

    return {
      lotId: lot.id,
      lotName: lot.name,
      currentRatePerHour: currentRate,
      pricingTier: factors.pricingTier,
      demandMultiplier: combined,
    };
  }));

  res.json(pricing);
});

export default router;
