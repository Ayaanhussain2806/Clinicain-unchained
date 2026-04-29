import { useGetCurrentPricing } from "@workspace/api-client-react";
import { TrendingUp, Loader2, Clock, Users, Building } from "lucide-react";
import { cn, formatCurrency, getPricingTierColor, getPricingTierLabel } from "@/lib/utils";

const TIER_INFO = [
  { tier: "off_peak", label: "Off-Peak", multiplier: "0.7x – 0.85x", description: "Late night (11PM–5AM) or weekends with low occupancy. Best rates available.", colorClass: "bg-emerald-50 border-emerald-200 text-emerald-800" },
  { tier: "standard", label: "Standard", multiplier: "1.0x", description: "Normal hours with moderate demand. Typical commuter pricing.", colorClass: "bg-blue-50 border-blue-200 text-blue-800" },
  { tier: "peak", label: "Peak", multiplier: "1.2x – 1.4x", description: "Rush hours (7–9AM, 5–8PM) with high occupancy. Plan ahead to save.", colorClass: "bg-orange-50 border-orange-200 text-orange-800" },
  { tier: "surge", label: "Surge", multiplier: "1.5x+", description: "Maximum demand. Prices are high — consider off-peak alternatives.", colorClass: "bg-red-50 border-red-200 text-red-800" },
];

const FACTORS = [
  { icon: <Clock size={18} />, name: "Time of Day", description: "Morning rush (7–9AM) and evening rush (5–8PM) see higher rates. Late night has discounts." },
  { icon: <Building size={18} />, name: "Lot Occupancy", description: "As occupancy rises above 60%, prices increase. Below 30% triggers off-peak discounts." },
  { icon: <Users size={18} />, name: "Day Demand", description: "Weekdays are priced higher than weekends due to commuter demand patterns." },
];

export default function Pricing() {
  const { data: pricing, isLoading } = useGetCurrentPricing();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dynamic Pricing</h1>
        <p className="text-slate-500 mt-1">Real-time pricing powered by demand, time, and occupancy signals</p>
      </div>

      {/* How it works */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-[#1e3a5f]" />How Dynamic Pricing Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FACTORS.map((f) => (
            <div key={f.name} className="bg-slate-50 rounded-xl p-4">
              <div className="w-9 h-9 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center text-[#1e3a5f] mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">{f.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-[#1e3a5f]/5 rounded-xl p-4 text-sm text-slate-600">
          <strong className="text-[#1e3a5f]">Formula:</strong> Final Rate = Base Rate × Time Multiplier × Occupancy Multiplier × Day Demand Multiplier
        </div>
      </section>

      {/* Pricing Tiers */}
      <section>
        <h2 className="font-semibold text-slate-900 mb-4">Pricing Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIER_INFO.map((tier) => (
            <div key={tier.tier} className={cn("rounded-xl border p-4", tier.colorClass)}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{tier.label}</span>
                <span className="text-xs font-mono bg-white/50 px-2 py-0.5 rounded">{tier.multiplier}</span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">{tier.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Rates */}
      <section>
        <h2 className="font-semibold text-slate-900 mb-4">Current Live Rates</h2>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#1e3a5f]" /></div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Parking Lot</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">Rate/Hour</th>
                  <th className="text-center px-4 py-3 text-slate-600 font-medium">Tier</th>
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {(pricing ?? []).map((p, i) => (
                  <tr key={p.lotId} className={cn("border-b border-slate-100 last:border-0", i % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.lotName}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#1e3a5f]">{formatCurrency(p.currentRatePerHour)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", getPricingTierColor(p.pricingTier))}>
                        {getPricingTierLabel(p.pricingTier)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 font-mono">{p.demandMultiplier.toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
