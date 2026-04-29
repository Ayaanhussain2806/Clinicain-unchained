import { useState } from "react";
import { useListAllBookings, useListParkingLots } from "@workspace/api-client-react";
import { Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminBookings() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [lotId, setLotId] = useState<number | undefined>(undefined);

  const { data, isLoading } = useListAllBookings({
    page, limit: 20,
    status: (status || undefined) as any,
    lotId,
  });

  const { data: lots } = useListParkingLots();

  if (!user || user.role !== "admin") {
    return <div className="text-center py-24 text-slate-400">Admin access required</div>;
  }

  const bookings = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#1e3a5f]">
          <ChevronLeft size={16} /> Dashboard
        </Link>
        <h1 className="text-xl font-bold text-slate-900">All Bookings</h1>
        <span className="text-sm text-slate-400">({total} total)</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={lotId ?? ""} onChange={(e) => { setLotId(e.target.value ? parseInt(e.target.value) : undefined); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white">
          <option value="">All Lots</option>
          {(lots ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#1e3a5f]" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">#</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Lot</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Slot</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Vehicle</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Type</th>
                  <th className="text-center px-4 py-3 text-slate-600 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id} className={cn("border-b border-slate-100 last:border-0", i % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                    <td className="px-4 py-2.5 text-slate-400 text-xs">{b.id}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{b.lotName}</td>
                    <td className="px-4 py-2.5 text-slate-600">{b.slotNumber}</td>
                    <td className="px-4 py-2.5 text-slate-600">{b.vehiclePlate}</td>
                    <td className="px-4 py-2.5 text-slate-500 capitalize">{b.bookingType}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", getStatusColor(b.status))}>{b.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-[#1e3a5f]">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs">{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
              <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-100 transition-colors flex items-center gap-1">
                  <ChevronLeft size={14} /> Prev
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-100 transition-colors flex items-center gap-1">
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
