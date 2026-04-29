const OFFLINE_KEY = "offline_bookings";

export interface OfflineBooking {
  id: number;
  lotName: string;
  slotNumber: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  bookingType: string;
  status: string;
  totalAmount: number;
  qrCode: string;
  savedAt: string;
}

export function saveBookingOffline(booking: OfflineBooking): void {
  const existing = getOfflineBookings();
  const filtered = existing.filter((b) => b.id !== booking.id);
  filtered.unshift({ ...booking, savedAt: new Date().toISOString() });
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(filtered.slice(0, 20)));
}

export function getOfflineBookings(): OfflineBooking[] {
  const raw = localStorage.getItem(OFFLINE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

export function isOnline(): boolean {
  return navigator.onLine;
}
