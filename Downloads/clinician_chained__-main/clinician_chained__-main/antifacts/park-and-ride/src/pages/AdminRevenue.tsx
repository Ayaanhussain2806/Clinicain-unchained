import { useState } from "react";
import { useGetRevenueStats } from "@workspace/api-client-react";
import { Loader2, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminRevenue() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const { data: revenue, isLoading } = useGetRevenueStats({ period }, { query: { enabled: true } });

  if (!user || user.role !== "admin") {
    return <div className="text-center py-24 text-slate-400">Admin access required</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#1e3a5f]">
            <ChevronLeft size={16} /> Dashboard
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Revenue Statistics</h1>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(["day", "week", "month"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all capitalize ${period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#1e3a5f]" /></div>
      ) : (
        <>
          <div className="bg-[#1e3a5f] rounded-xl p-5 text-white">
            <p className="text-white/60 text-sm">Total Revenue ({period})</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(revenue?.totalRevenue ?? 0)}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Revenue Timeline</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenue?.timeline ?? []} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [formatCurrency(v as number), "Revenue"]} />
                <Bar dataKey="revenue" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Bookings Timeline</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenue?.timeline ?? []} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Revenue by Lot</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-slate-600 font-medium">Lot</th>
                  <th className="text-right px-4 py-2.5 text-slate-600 font-medium">Revenue</th>
                  <th className="text-right px-4 py-2.5 text-slate-600 font-medium">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {(revenue?.byLot ?? []).map((l, i) => (
                  <tr key={l.lotId} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{l.lotName}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-[#1e3a5f]">{formatCurrency(l.revenue)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{l.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
