import { useState } from "react";
import { useListRides, useBookRide, useCancelRide, useListParkingLots, getListRidesQueryKey } from "@workspace/api-client-react";
import { Bike, Loader2, Plus, X, Car, Navigation } from "lucide-react";
import { cn, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export default function Rides() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    pickupLotId: 0,
    destination: "",
    rideType: "cab" as "cab" | "shuttle" | "erickshaw",
    isPooled: false,
    scheduledTime: "",
  });
  const [formError, setFormError] = useState("");
  const qc = useQueryClient();

  const { data: rides, isLoading } = useListRides();
  const { data: lots } = useListParkingLots();
  const bookRideMut = useBookRide();
  const cancelRideMut = useCancelRide();

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pickupLotId || !form.destination) { setFormError("Please fill all fields"); return; }
    setFormError("");

    bookRideMut.mutate({
      data: {
        pickupLotId: form.pickupLotId,
        destination: form.destination,
        rideType: form.rideType,
        isPooled: form.isPooled,
        scheduledTime: form.scheduledTime || null,
      }
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListRidesQueryKey() });
        setShowForm(false);
        setForm({ pickupLotId: 0, destination: "", rideType: "cab", isPooled: false, scheduledTime: "" });
      },
      onError: (err: any) => setFormError(err?.data?.error ?? "Booking failed"),
    });
  };

  const handleCancel = (id: number) => {
    cancelRideMut.mutate({ id }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListRidesQueryKey() }),
    });
  };

  const rideTypeIcons: Record<string, typeof Car> = { cab: Car, shuttle: Car, erickshaw: Bike };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Last-Mile Rides</h1>
          <p className="text-slate-500 mt-1">Book cabs, shuttles, and e-rickshaws from parking lots</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-[#1e3a5f] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#2d5a8e] transition-colors">
          <Plus size={16} /> {showForm ? "Cancel" : "Book Ride"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">New Ride Booking</h2>
          {formError && <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{formError}</div>}

          <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Pickup Location</label>
              <select value={form.pickupLotId || ""} onChange={(e) => setForm((p) => ({ ...p, pickupLotId: parseInt(e.target.value) }))}
                required className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
                <option value="">Select parking lot</option>
                {(lots ?? []).map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Destination</label>
              <input type="text" value={form.destination} onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
                required placeholder="Enter destination address"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ride Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(["cab", "shuttle", "erickshaw"] as const).map((t) => (
                  <button type="button" key={t} onClick={() => setForm((p) => ({ ...p, rideType: t }))}
                    className={cn("py-2 text-xs font-medium rounded-lg border transition-all capitalize", form.rideType === t ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "border-slate-300 text-slate-600 hover:border-[#1e3a5f]")}>
                    {t === "erickshaw" ? "E-Rickshaw" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Schedule (optional)</label>
              <input type="datetime-local" value={form.scheduledTime} onChange={(e) => setForm((p) => ({ ...p, scheduledTime: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="pooled" checked={form.isPooled} onChange={(e) => setForm((p) => ({ ...p, isPooled: e.target.checked }))}
                className="w-4 h-4 accent-[#1e3a5f] rounded" />
              <label htmlFor="pooled" className="text-sm text-slate-700">Shared ride <span className="text-xs text-emerald-600 font-semibold">(25% cheaper)</span></label>
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={bookRideMut.isPending}
                className="bg-[#1e3a5f] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#2d5a8e] transition-colors flex items-center gap-2 disabled:opacity-60">
                {bookRideMut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                Book Now
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-[#1e3a5f]" /></div>
      ) : (rides ?? []).length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bike size={40} className="mx-auto mb-3 opacity-30" />
          <p>No rides yet</p>
          <p className="text-sm mt-1">Book your first last-mile ride</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(rides ?? []).map((ride) => {
            const Icon = rideTypeIcons[ride.rideType] ?? Car;
            return (
              <div key={ride.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={18} className="text-[#1e3a5f]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 capitalize">{ride.rideType === "erickshaw" ? "E-Rickshaw" : ride.rideType}</h3>
                        {ride.isPooled && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Shared</span>}
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getStatusColor(ride.status))}>{ride.status}</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {ride.pickupLotName} → {ride.destination}
                      </p>
                      {ride.driverName && (
                        <p className="text-xs text-slate-400 mt-1">
                          Driver: {ride.driverName} · {ride.driverPhone}
                          {ride.vehicleNumber && ` · ${ride.vehicleNumber}`}
                        </p>
                      )}
                      {ride.estimatedArrivalMinutes && ride.status === "confirmed" && (
                        <p className="text-xs text-emerald-600 font-medium mt-1">ETA: {ride.estimatedArrivalMinutes} min</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{formatDate(ride.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="font-bold text-[#1e3a5f]">{formatCurrency(ride.estimatedFare)}</div>
                    {["requested", "confirmed"].includes(ride.status) && (
                      <button onClick={() => handleCancel(ride.id)} disabled={cancelRideMut.isPending}
                        className="mt-2 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
                        <X size={12} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
