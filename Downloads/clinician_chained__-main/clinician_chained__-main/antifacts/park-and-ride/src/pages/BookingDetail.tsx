import { useParams, useLocation } from "wouter";
import { useGetBooking, useCancelBooking, useCheckinBooking, useCheckoutBooking, getListBookingsQueryKey } from "@workspace/api-client-react";
import { Loader2, ChevronLeft, Car, QrCode, Download, LogIn, LogOut, X } from "lucide-react";
import { cn, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { saveBookingOffline } from "@/lib/offline";
import { useState } from "react";

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const bookingId = parseInt(id, 10);
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [actionError, setActionError] = useState("");

  const { data: booking, isLoading, refetch } = useGetBooking(bookingId, { query: { enabled: !!bookingId } });
  const cancelMut = useCancelBooking();
  const checkinMut = useCheckinBooking();
  const checkoutMut = useCheckoutBooking();

  const handleAction = (action: "cancel" | "checkin" | "checkout") => {
    setActionError("");
    const mutation = action === "cancel" ? cancelMut : action === "checkin" ? checkinMut : checkoutMut;
    mutation.mutate({ id: bookingId } as any, {
      onSuccess: () => {
        refetch();
        qc.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      },
      onError: (err: any) => {
        setActionError(err?.data?.error ?? "Action failed");
      },
    });
  };

  const handleSaveOffline = () => {
    if (!booking) return;
    saveBookingOffline({
      id: booking.id,
      lotName: booking.lotName,
      slotNumber: booking.slotNumber,
      vehiclePlate: booking.vehiclePlate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingType: booking.bookingType,
      status: booking.status,
      totalAmount: booking.totalAmount,
      qrCode: booking.qrCode ?? "",
      savedAt: new Date().toISOString(),
    });
    alert("Booking saved for offline access!");
  };

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-[#1e3a5f]" /></div>;
  }

  if (!booking) {
    return <div className="text-center py-24 text-slate-500">Booking not found</div>;
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/bookings" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1e3a5f]">
        <ChevronLeft size={16} /> Back to bookings
      </Link>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{actionError}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#1e3a5f] px-6 py-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-white font-bold text-xl">{booking.lotName}</h1>
              <p className="text-white/60 text-sm mt-0.5">Booking #{booking.id}</p>
            </div>
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold", getStatusColor(booking.status))}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* QR Code */}
          {booking.qrCode && (
            <div className="flex flex-col items-center border border-slate-200 rounded-xl p-4 bg-slate-50">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5"><QrCode size={16} />Entry/Exit QR Code</p>
              <img src={booking.qrCode} alt="Booking QR Code" className="w-40 h-40 rounded-lg" />
              <p className="text-xs text-slate-400 mt-2">Show this at the parking gate</p>
              <button onClick={handleSaveOffline}
                className="mt-3 flex items-center gap-1.5 text-sm text-[#1e3a5f] font-medium hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
                <Download size={14} /> Save for offline access
              </button>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Slot", value: booking.slotNumber },
              { label: "Vehicle", value: booking.vehiclePlate },
              { label: "Vehicle Type", value: booking.vehicleType },
              { label: "Booking Type", value: booking.bookingType },
              { label: "Start", value: formatDate(booking.startTime) },
              { label: "End", value: formatDate(booking.endTime) },
              { label: "Total Amount", value: formatCurrency(booking.totalAmount) },
              { label: "Created", value: formatDate(booking.createdAt) },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-lg p-2.5">
                <div className="text-xs text-slate-400">{item.label}</div>
                <div className="font-medium text-slate-800 mt-0.5 capitalize">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Check-in/out timestamps */}
          {(booking.checkedInAt || booking.checkedOutAt) && (
            <div className="border-t border-slate-100 pt-3 space-y-1 text-sm">
              {booking.checkedInAt && (
                <p className="text-emerald-700"><span className="font-semibold">Checked in:</span> {formatDate(booking.checkedInAt)}</p>
              )}
              {booking.checkedOutAt && (
                <p className="text-blue-700"><span className="font-semibold">Checked out:</span> {formatDate(booking.checkedOutAt)}</p>
              )}
            </div>
          )}

          {/* Actions */}
          {booking.status === "active" && (
            <div className="flex gap-2 flex-wrap">
              {!booking.checkedInAt && (
                <button onClick={() => handleAction("checkin")} disabled={checkinMut.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60">
                  {checkinMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                  Check In
                </button>
              )}
              {booking.checkedInAt && !booking.checkedOutAt && (
                <button onClick={() => handleAction("checkout")} disabled={checkoutMut.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1e3a5f] text-white text-sm font-semibold rounded-lg hover:bg-[#2d5a8e] transition-colors disabled:opacity-60">
                  {checkoutMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                  Check Out
                </button>
              )}
              <button onClick={() => handleAction("cancel")} disabled={cancelMut.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-60">
                {cancelMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
