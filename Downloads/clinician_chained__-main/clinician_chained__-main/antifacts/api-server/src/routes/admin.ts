import { Router, type IRouter } from "express";
import { db, bookingsTable, usersTable, parkingLotsTable, parkingSlotsTable } from "@workspace/db";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { ListAllBookingsQueryParams, GetRevenueStatsQueryParams } from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

async function formatBookingAdmin(booking: typeof bookingsTable.$inferSelect) {
  const [lot] = await db.select({ name: parkingLotsTable.name }).from(parkingLotsTable).where(eq(parkingLotsTable.id, booking.lotId));
  const [slot] = await db.select({ slotNumber: parkingSlotsTable.slotNumber }).from(parkingSlotsTable).where(eq(parkingSlotsTable.id, booking.slotId));

  return {
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
}

router.get("/admin/dashboard", requireAdmin, async (_req, res): Promise<void> => {
  const allBookings = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));
  const allUsers = await db.select().from(usersTable);
  const allLots = await db.select().from(parkingLotsTable);
  const allSlots = await db.select().from(parkingSlotsTable);

  const totalRevenue = allBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const activeBookings = allBookings.filter((b) => b.status === "active").length;
  const occupiedSlots = allSlots.filter((s) => s.status === "occupied").length;
  const avgOccupancy = allSlots.length > 0 ? (occupiedSlots / allSlots.length) * 100 : 0;

  const recentBookings = await Promise.all(
    allBookings.slice(0, 5).map(formatBookingAdmin)
  );

  res.json({
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalBookings: allBookings.length,
    activeBookings,
    totalUsers: allUsers.length,
    avgOccupancyPercent: parseFloat(avgOccupancy.toFixed(1)),
    totalLots: allLots.length,
    recentBookings,
  });
});

router.get("/admin/bookings", requireAdmin, async (req, res): Promise<void> => {
  const params = ListAllBookingsQueryParams.safeParse({
    ...req.query,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    lotId: req.query.lotId ? parseInt(req.query.lotId as string, 10) : undefined,
  });

  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;
  const status = params.success ? params.data.status : undefined;
  const lotId = params.success ? params.data.lotId : undefined;

  const conditions = [];
  if (status) conditions.push(eq(bookingsTable.status, status));
  if (lotId) conditions.push(eq(bookingsTable.lotId, lotId));

  const allBookings = await db.select().from(bookingsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookingsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(bookingsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const formatted = await Promise.all(allBookings.map(formatBookingAdmin));

  res.json({
    data: formatted,
    total: Number(countResult.count),
    page,
    limit,
  });
});

router.get("/admin/revenue", requireAdmin, async (req, res): Promise<void> => {
  const params = GetRevenueStatsQueryParams.safeParse({ period: req.query.period ?? "week" });
  const period = params.success ? (params.data.period ?? "week") : "week";

  const now = new Date();
  let startDate = new Date();
  if (period === "day") startDate.setDate(now.getDate() - 1);
  else if (period === "week") startDate.setDate(now.getDate() - 7);
  else startDate.setMonth(now.getMonth() - 1);

  const bookings = await db.select().from(bookingsTable)
    .where(and(eq(bookingsTable.status, "completed"), gte(bookingsTable.createdAt, startDate)));

  const lots = await db.select().from(parkingLotsTable);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const byLot = lots.map((lot) => {
    const lotBookings = bookings.filter((b) => b.lotId === lot.id);
    return {
      lotId: lot.id,
      lotName: lot.name,
      revenue: parseFloat(lotBookings.reduce((s, b) => s + b.totalAmount, 0).toFixed(2)),
      bookings: lotBookings.length,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const timeline: { label: string; revenue: number; bookings: number }[] = [];
  if (period === "day") {
    for (let h = 0; h < 24; h++) {
      const hourBookings = bookings.filter((b) => new Date(b.createdAt).getHours() === h);
      timeline.push({
        label: `${h.toString().padStart(2, "0")}:00`,
        revenue: parseFloat(hourBookings.reduce((s, b) => s + b.totalAmount, 0).toFixed(2)),
        bookings: hourBookings.length,
      });
    }
  } else if (period === "week") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(now.getDate() - d);
      const dayBookings = bookings.filter((b) => {
        const bd = new Date(b.createdAt);
        return bd.toDateString() === date.toDateString();
      });
      timeline.push({
        label: days[date.getDay()],
        revenue: parseFloat(dayBookings.reduce((s, b) => s + b.totalAmount, 0).toFixed(2)),
        bookings: dayBookings.length,
      });
    }
  } else {
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - w * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      const weekBookings = bookings.filter((b) => {
        const bd = new Date(b.createdAt);
        return bd >= weekStart && bd < weekEnd;
      });
      timeline.push({
        label: `Week ${4 - w}`,
        revenue: parseFloat(weekBookings.reduce((s, b) => s + b.totalAmount, 0).toFixed(2)),
        bookings: weekBookings.length,
      });
    }
  }

  res.json({
    period,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    byLot,
    timeline,
  });
});

router.get("/admin/occupancy", requireAdmin, async (_req, res): Promise<void> => {
  const lots = await db.select().from(parkingLotsTable);
  const slots = await db.select().from(parkingSlotsTable);

  const stats = lots.map((lot) => {
    const lotSlots = slots.filter((s) => s.lotId === lot.id);
    const occupiedSlots = lotSlots.filter((s) => s.status === "occupied").length;
    const occupancyPercent = lotSlots.length > 0 ? (occupiedSlots / lotSlots.length) * 100 : 0;
    return {
      lotId: lot.id,
      lotName: lot.name,
      totalSlots: lotSlots.length,
      occupiedSlots,
      occupancyPercent: parseFloat(occupancyPercent.toFixed(1)),
    };
  });

  res.json(stats);
});

export default router;
