import { useState } from "react";
import { Link } from "wouter";
import { useListParkingLots, useGetCurrentPricing } from "@workspace/api-client-react";
import { MapPin, Car, Search, Star, Loader2 } from "lucide-react";
import { cn, formatCurrency, getPricingTierColor, getPricingTierLabel } from "@/lib/utils";

export default function Lots() {
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("");

  const { data: lots, isLoading } = useListParkingLots();
  const { data: pricing } = useGetCurrentPricing();

  const filtered = (lots ?? []).filter((lot) => {
    const matchesSearch = !search || lot.name.toLowerCase().includes(search.toLowerCase()) || lot.city.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Parking Lots</h1>
        <p className="text-slate-500 mt-1">Find and book available parking spots near metro stations</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          />
        </div>
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
        >
          <option value="">All Vehicles</option>
          <option value="car">Car</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="ev">EV</option>
        </select>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Lots", value: lots?.length ?? 0 },
          { label: "Available Slots", value: (lots ?? []).reduce((s, l) => s + l.availableSlots, 0) },
          { label: "Cities", value: new Set(lots?.map((l) => l.city)).size },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1e3a5f] rounded-xl p-3 text-center text-white">
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs text-white/60 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lot) => {
          const lotPricing = pricing?.find((p) => p.lotId === lot.id);
          const occupancyPct = lot.totalSlots > 0 ? ((lot.totalSlots - lot.availableSlots) / lot.totalSlots) * 100 : 0;

          return (
            <Link key={lot.id} href={`/lots/${lot.id}`} className="block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
              {/* Color header based on availability */}
              <div className={cn("h-2", lot.availableSlots === 0 ? "bg-red-400" : lot.availableSlots < 10 ? "bg-amber-400" : "bg-emerald-400")} />

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{lot.name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin size={12} className="shrink-0" /> {lot.address}
                    </p>
                  </div>
                  {lotPricing && (
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ml-2", getPricingTierColor(lotPricing.pricingTier))}>
                      {getPricingTierLabel(lotPricing.pricingTier)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-slate-500">{lot.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-300 mx-1">|</span>
                  <Car size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-500">{lot.totalSlots} slots</span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Occupancy</span>
                    <span>{Math.round(occupancyPct)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", occupancyPct > 80 ? "bg-red-500" : occupancyPct > 60 ? "bg-amber-500" : "bg-emerald-500")}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-lg font-bold text-[#1e3a5f]">{formatCurrency(lot.baseRatePerHour)}</span>
                    <span className="text-xs text-slate-400">/hr</span>
                  </div>
                  <div className={cn("text-sm font-semibold", lot.availableSlots > 0 ? "text-emerald-600" : "text-red-600")}>
                    {lot.availableSlots > 0 ? `${lot.availableSlots} free` : "Full"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {((lot.amenities ?? []) as string[]).slice(0, 3).map((a) => (
                    <span key={a} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <MapPin size={32} className="mx-auto mb-2 opacity-40" />
          <p>No parking lots match your search</p>
        </div>
      )}
    </div>
  );
}
