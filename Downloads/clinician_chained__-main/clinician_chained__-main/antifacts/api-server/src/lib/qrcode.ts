import QRCode from "qrcode";

/**
 * Generate a QR code PNG as a base64 data URL for a booking.
 * The QR payload encodes booking ID, lot, slot, and vehicle info.
 */
export async function generateBookingQr(params: {
  bookingId: number;
  lotName: string;
  slotNumber: string;
  vehiclePlate: string;
  startTime: string;
  endTime: string;
}): Promise<string> {
  const payload = JSON.stringify({
    bid: params.bookingId,
    lot: params.lotName,
    slot: params.slotNumber,
    plate: params.vehiclePlate,
    start: params.startTime,
    end: params.endTime,
  });

  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    width: 300,
    margin: 2,
    color: {
      dark: "#1e3a5f",
      light: "#ffffff",
    },
  });

  return dataUrl;
}
