import { Link } from "wouter";
import { useListParkingLots, useGetCurrentPricing } from "@workspace/api-client-react";
import { MapPin, Car, TrendingUp, Smartphone, Shield, Clock } from "lucide-react";
import { cn, formatCurrency, getPricingTierColor, getPricingTierLabel } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-white/60 text-sm mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center mb-3 text-[#1e3a5f]">{icon}</div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

import { ReactNode } from "react";

export default function Home() {
  const { user } = useAuth();
  const { data: lots } = useListParkingLots();
  const { data: pricing } = useGetCurrentPricing();

  const totalAvailable = lots?.reduce((sum, l) => sum + l.availableSlots, 0) ?? 0;
  const totalSlots = lots?.reduce((sum, l) => sum + l.totalSlots, 0) ?? 0;

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1e3a5f] via-[#1e3a5f] to-[#2d5a8e] p-8 md:p-12 text-white relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #f59e0b 0%, transparent 60%)" }} />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 text-amber-300 text-sm font-medium mb-4 bg-white/10 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            Real-time availability
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Smart Parking & Last-Mile Connectivity
          </h1>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            Pre-book parking near metro stations, get dynamic pricing, and book last-mile rides — all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/lots" className="bg-amber-400 text-[#1e3a5f] font-bold px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors flex items-center gap-2">
              <MapPin size={18} />
              Find Parking
            </Link>
            {!user && (
              <Link href="/signup" className="bg-white/10 text-white border border-white/20 font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">
                Get Started
              </Link>
            )}
          </div>
        </div>

        <div className="mt-8 md:mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
          <StatCard value={lots?.length.toString() ?? "—"} label="Parking Locations" />
          <StatCard value={totalAvailable.toString()} label="Available Slots" />
          <StatCard value={`${totalSlots > 0 ? Math.round(((totalSlots - totalAvailable) / totalSlots) * 100) : 0}%`} label="Occupancy" />
        </div>
      </section>

      {/* Featured Lots */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Nearby Parking Lots</h2>
          <Link href="/lots" className="text-sm text-[#1e3a5f] font-semibold hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(lots ?? []).slice(0, 3).map((lot) => {
            const lotPricing = pricing?.find((p) => p.lotId === lot.id);
            return (
              <Link key={lot.id} href={`/lots/${lot.id}`} className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{lot.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} /> {lot.city}
                    </p>
                  </div>
                  {lotPricing && (
                    <span className={cn("text-xs px-2 py-1 rounded-full border font-medium", getPricingTierColor(lotPricing.pricingTier))}>
                      {getPricingTierLabel(lotPricing.pricingTier)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-[#1e3a5f]">{formatCurrency(lot.baseRatePerHour)}<span className="text-sm font-normal text-slate-500">/hr</span></div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-sm font-semibold", lot.availableSlots > 10 ? "text-emerald-600" : lot.availableSlots > 0 ? "text-amber-600" : "text-red-600")}>
                      {lot.availableSlots} available
                    </div>
                    <div className="text-xs text-slate-400">{lot.totalSlots} total</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", lot.availableSlots / lot.totalSlots > 0.4 ? "bg-emerald-500" : lot.availableSlots / lot.totalSlots > 0.1 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${((lot.totalSlots - lot.availableSlots) / lot.totalSlots) * 100}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Everything you need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon={<Car size={20} />} title="Smart Slot Assignment" description="Dynamic allocation directs you to the nearest available slot based on real-time occupancy." />
          <FeatureCard icon={<Smartphone size={20} />} title="QR Code Access" description="Get a scannable QR code for contactless entry and exit. Works offline too." />
          <FeatureCard icon={<TrendingUp size={20} />} title="Dynamic Pricing" description="AI-powered pricing adjusts based on demand, time of day, and occupancy levels." />
          <FeatureCard icon={<MapPin size={20} />} title="Last-Mile Rides" description="Book cabs, shuttles, or e-rickshaws directly from the parking lot." />
          <FeatureCard icon={<Shield size={20} />} title="Secure Bookings" description="JWT-authenticated bookings with flexible cancellation and refund policies." />
          <FeatureCard icon={<Clock size={20} />} title="Flexible Plans" description="Choose hourly, daily, or monthly parking plans to suit your commute." />
        </div>
      </section>

      {/* Current Pricing */}
      {pricing && pricing.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Live Pricing Tiers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pricing.map((p) => (
              <div key={p.lotId} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border w-fit mb-2", getPricingTierColor(p.pricingTier))}>
                  {getPricingTierLabel(p.pricingTier)}
                </div>
                <div className="text-sm font-medium text-slate-800">{p.lotName}</div>
                <div className="text-lg font-bold text-[#1e3a5f] mt-1">{formatCurrency(p.currentRatePerHour)}/hr</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
