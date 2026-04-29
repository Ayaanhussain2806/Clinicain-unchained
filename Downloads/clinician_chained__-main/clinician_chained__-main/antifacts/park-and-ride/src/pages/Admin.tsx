import { Link } from "wouter";
import { useGetAdminDashboard, useGetOccupancyStats } from "@workspace/api-client-react";
import { Loader2, TrendingUp, Users, BookOpen, Car, BarChart2, ChevronRight } from "lucide-react";
import { cn, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center text-[#1e3a5f]">{icon}</div>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useGetAdminDashboard();
  const { data: occupancy } = useGetOccupancyStats();

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-24">
        <div className="text-slate-400 mb-3">You don't have admin access</div>
        <Link href="/" className="text-[#1e3a5f] font-semibold hover:underline">Go home</Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-[#1e3a5f]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">System-wide overview and management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/bookings" className="text-sm bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a8e] transition-colors flex items-center gap-1.5">
            <BookOpen size={14} /> All Bookings
          </Link>
          <Link href="/admin/revenue" className="text-sm bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <BarChart2 size={14} /> Revenue
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<TrendingUp size={18} />} label="Total Revenue" value={formatCurrency(dashboard?.totalRevenue ?? 0)} sub="All completed bookings" />
        <StatCard icon={<BookOpen size={18} />} label="Total Bookings" value={dashboard?.totalBookings ?? 0} sub={`${dashboard?.activeBookings ?? 0} active`} />
        <StatCard icon={<Users size={18} />} label="Total Users" value={dashboard?.totalUsers ?? 0} sub="Registered accounts" />
        <StatCard icon={<Car size={18} />} label="Avg Occupancy" value={`${dashboard?.avgOccupancyPercent ?? 0}%`} sub={`${dashboard?.totalLots ?? 0} parking lots`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Lot Occupancy</h2>
          {occupancy && occupancy.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={occupancy} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="lotName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, "Occupancy"]} />
                <Bar dataKey="occupancyPercent" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-300">No data</div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-[#1e3a5f] font-semibold flex items-center gap-0.5 hover:underline">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {(dashboard?.recentBookings ?? []).map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                <div>
                  <span className="font-medium text-slate-800">{b.lotName}</span>
                  <span className="text-slate-400 ml-2 text-xs">#{b.id}</span>
                  <p className="text-xs text-slate-400">{b.vehiclePlate} · {formatDate(b.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1e3a5f]">{formatCurrency(b.totalAmount)}</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", getStatusColor(b.status))}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
