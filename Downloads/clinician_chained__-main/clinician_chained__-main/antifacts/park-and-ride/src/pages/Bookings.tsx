import { useState } from "react";
import { Link } from "wouter";
import { useListBookings } from "@workspace/api-client-react";
import { BookOpen, Loader2, Car, QrCode, Download, WifiOff } from "lucide-react";
import { cn, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { getOfflineBookings, isOnline } from "@/lib/offline";

type StatusFilter = "active" | "completed" | "cancelled" | undefined;

export default function Bookings() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);
  const online = isOnline();

  const { data: bookings, isLoading } = useListBookings(
    statusFilter ? { status: statusFilter } : {},
    { query: { enabled: online } }
  );

  const offlineBookings = online ? [] : getOfflineBookings();

  const displayBookings = online ? (bookings ?? []) : offlineBookings;

  const tabs: { label: string; value: StatusFilter }[] = [
    { label: "All", value: undefined },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  if (!online) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700">
          <WifiOff size={18} />
          <div>
            <p className="font-semibold text-sm">You are offline</p>
            <p className="text-xs mt-0.5">Showing saved bookings from your device</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Your Bookings</h1>

        {offlineBookings.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>No saved bookings found</p>
            <p className="text-sm mt-1">Save a booking's QR code while online to access it offline</p>
          </div>
        ) : (
          <div className="space-y-3">
            {offlineBookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">{b.lotName}</h3>
                    <p className="text-sm text-slate-500">Slot {b.slotNumber} · {b.vehiclePlate}</p>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getStatusColor(b.status))}>{b.status}</span>
                </div>
                <img src={b.qrCode} alt="QR Code" className="w-28 h-28 mt-3 rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Your Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button key={tab.label} onClick={() => setStatusFilter(tab.value)}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
              statusFilter === tab.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-[#1e3a5f]" /></div>
      ) : displayBookings.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No bookings found</p>
          <Link href="/lots" className="inline-block mt-3 text-sm text-[#1e3a5f] font-semibold hover:underline">Browse parking lots</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(displayBookings as any[]).map((b) => (
            <Link key={b.id} href={`/bookings/${b.id}`} className="block bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm hover:border-[#1e3a5f]/30 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{b.lotName}</h3>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", getStatusColor(b.status))}>{b.status}</span>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Car size={12} /> {b.vehiclePlate} · Slot {b.slotNumber}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{formatDate(b.startTime)} → {formatDate(b.endTime)}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold text-[#1e3a5f]">{formatCurrency(b.totalAmount)}</div>
                  <div className="text-xs text-slate-400 capitalize mt-0.5">{b.bookingType}</div>
                  <div className="flex items-center gap-1 mt-1 justify-end text-slate-400">
                    <QrCode size={12} />
                    <span className="text-xs">QR Code</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
