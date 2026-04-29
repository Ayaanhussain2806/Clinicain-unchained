/**
 * Dynamic Pricing Engine — rule-based ML simulation using demand, time, and occupancy.
 * Uses a simple linear regression-inspired formula:
 *   finalRate = baseRate * timeMultiplier * demandMultiplier * occupancyMultiplier
 */

export type PricingTier = "off_peak" | "standard" | "peak" | "surge";

export interface PricingFactors {
  demandMultiplier: number;
  timeMultiplier: number;
  occupancyMultiplier: number;
  pricingTier: PricingTier;
}

/**
 * Time-of-day multiplier (simulates commuter rush hours)
 * Off-peak: 0.7x, Standard: 1.0x, Peak: 1.3x, Late-night: 0.6x
 */
export function getTimeMultiplier(hour: number): number {
  if (hour >= 7 && hour <= 9) return 1.3;   // morning rush
  if (hour >= 17 && hour <= 20) return 1.4;  // evening rush
  if (hour >= 23 || hour <= 5) return 0.6;   // late night discount
  return 1.0;
}

/**
 * Occupancy-based multiplier — simulates demand surge pricing.
 * Under 30%: discount, 30-60%: normal, 60-80%: premium, 80%+: surge
 */
export function getOccupancyMultiplier(occupancyPercent: number): number {
  if (occupancyPercent >= 80) return 1.5;
  if (occupancyPercent >= 60) return 1.2;
  if (occupancyPercent <= 30) return 0.85;
  return 1.0;
}

/**
 * Day-of-week demand multiplier
 * Weekdays: higher, weekends: moderate
 */
export function getDayDemandMultiplier(): number {
  const day = new Date().getDay();
  if (day === 0 || day === 6) return 0.9; // weekend
  return 1.0;
}

/**
 * Classify the overall pricing tier from combined multiplier
 */
export function classifyTier(finalMultiplier: number): PricingTier {
  if (finalMultiplier >= 1.5) return "surge";
  if (finalMultiplier >= 1.2) return "peak";
  if (finalMultiplier <= 0.8) return "off_peak";
  return "standard";
}

/**
 * Compute dynamic pricing factors for a given lot occupancy at the current time.
 */
export function computePricingFactors(occupiedSlots: number, totalSlots: number): PricingFactors {
  const occupancyPercent = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;
  const hour = new Date().getHours();

  const timeMultiplier = getTimeMultiplier(hour);
  const occupancyMultiplier = getOccupancyMultiplier(occupancyPercent);
  const demandMultiplier = getDayDemandMultiplier();

  const combined = timeMultiplier * occupancyMultiplier * demandMultiplier;
  const pricingTier = classifyTier(combined);

  return {
    timeMultiplier: parseFloat(timeMultiplier.toFixed(2)),
    occupancyMultiplier: parseFloat(occupancyMultiplier.toFixed(2)),
    demandMultiplier: parseFloat(demandMultiplier.toFixed(2)),
    pricingTier,
  };
}

/**
 * Compute the final rate per hour given base rate and pricing factors
 */
export function computeCurrentRate(baseRate: number, factors: PricingFactors): number {
  const rate = baseRate * factors.timeMultiplier * factors.occupancyMultiplier * factors.demandMultiplier;
  return parseFloat(rate.toFixed(2));
}

/**
 * Estimate total cost for a booking duration
 */
export function estimateTotal(ratePerHour: number, durationHours: number): number {
  const total = ratePerHour * durationHours;
  return parseFloat(total.toFixed(2));
}

/**
 * Estimate fare for last-mile rides based on type and destination length
 */
export function estimateRideFare(rideType: string, destinationLength: number, isPooled: boolean): number {
  const baseFares: Record<string, number> = {
    cab: 50,
    shuttle: 30,
    erickshaw: 20,
  };
  const perKmRate: Record<string, number> = {
    cab: 12,
    shuttle: 8,
    erickshaw: 6,
  };

  const base = baseFares[rideType] ?? 40;
  const km = Math.min(destinationLength * 0.05, 20);
  const fare = base + km * (perKmRate[rideType] ?? 10);
  const poolDiscount = isPooled ? 0.75 : 1.0;
  return parseFloat((fare * poolDiscount).toFixed(2));
}
