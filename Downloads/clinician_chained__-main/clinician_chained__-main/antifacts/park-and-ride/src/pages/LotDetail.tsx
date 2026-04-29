import { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetParkingLot,
  useGetPricingEstimate,
  useCreateBooking,
  useGetLotAvailability,
} from "@workspace/api-client-react";
import { MapPin, Car, Loader2, ChevronLeft, Star, Zap, Bike, Accessibility, ShieldCheck, ShieldX, Search } from "lucide-react";
import { cn, formatCurrency, getPricingTierColor, getPricingTierLabel } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getListBookingsQueryKey, getGetLotAvailabilityQueryKey } from "@workspace/api-client-react";
import PaymentModal from "@/components/PaymentModal";

interface VehicleInfo {
  valid: boolean;
  regNo?: string;
  source?: string;
  message?: string;
  ownerName?: string;
  vehicleModel?: string;
  fuelType?: string;
  vehicleClass?: string;
  registrationDate?: string;
  fitnessUpto?: string;
  error?: string;
  hint?: string;
}

const SLOT_TYPE_ICONS: Record<string, typeof Car> = {
  standard: Car,
  ev: Zap,
  motorcycle: Bike,
  handicap: Accessibility,
};

function addHours(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString().slice(0, 16);
}

interface PendingPayment {
  bookingId: number;
  amount: number;
  lotName: string;
  slotNumber: string;
}

export default function LotDetail() {
  const { id } = useParams<{ id: string }>();
  const lotId = parseInt(id, 10);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: lot, isLoading } = useGetParkingLot(lotId, { query: { enabled: !!lotId } });
  const { data: availability } = useGetLotAvailability(lotId, { query: { enabled: !!lotId } });

  const [vehicleType, setVehicleType] = useState<"car" | "motorcycle" | "ev">("car");
  const [vehiclePlate, setVehiclePlate] = useState(user?.vehiclePlate ?? "");
  const [duration, setDuration] = useState(2);
  const [bookingType, setBookingType] = useState<"hourly" | "daily" | "monthly">("hourly");
  const [startTime, setStartTime] = useState(addHours(0));
  const [bookingError, setBookingError] = useState("");
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [verifying, setVerifying] = useState(false);
  const lastVerified = useRef<string>("");

  const handleVerifyPlate = async () => {
    const plate = vehiclePlate.trim();
    if (!plate || plate === lastVerified.current) return;
    setVerifying(true);
    setVehicleInfo(null);
    try {
      const res = await fetch(`/api/vehicle/check/${encodeURIComponent(plate)}`);
      const data: VehicleInfo = await res.json();
      setVehicleInfo(data);
      lastVerified.current = plate;
    } catch {
      setVehicleInfo({ valid: false, error: "Could not reach verification service" });
    } finally {
      setVerifying(false);
    }
  };

  const endTime = new Date(new Date(startTime).getTime() + duration * 60 * 60 * 1000).toISOString().slice(0, 16);

  const { data: pricingEst } = useGetPricingEstimate(
    { lotId, durationHours: duration, vehicleType },
    { query: { enabled: !!lotId } }
  );

  const createBooking = useCreateBooking();

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setBookingError("");

    createBooking.mutate({
      data: {
        lotId,
        vehicleType,
        vehiclePlate,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        bookingType,
      }
    }, {
      onSuccess: (booking) => {
        qc.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetLotAvailabilityQueryKey(lotId) });
        setPendingPayment({
          bookingId: booking.id,
          amount: booking.totalAmount,
          lotName: booking.lotName,
          slotNumber: booking.slotNumber,
        });
      },
      onError: (err: any) => {
        setBookingError(err?.data?.error ?? "Booking failed");
      },
    });
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setPendingPayment(null);
    setPaymentDone(true);
    setTimeout(() => navigate("/bookings"), 1800);
  };

  const handlePaymentClose = () => {
    setPendingPayment(null);
    navigate("/bookings");
  };

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 size={32} className="animate-spin text-[#1e3a5f]" /></div>;
  }

  if (!lot) {
    return <div className="text-center py-24 text-slate-500">Parking lot not found</div>;
  }

  const slots = lot.slots ?? [];

  return (
    <>
      {pendingPayment && (
        <PaymentModal
          bookingId={pendingPayment.bookingId}
          amount={pendingPayment.amount}
          lotName={pendingPayment.lotName}
          slotNumber={pendingPayment.slotNumber}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}

      <div className="space-y-6 max-w-5xl">
        <Link href="/lots" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1e3a5f] transition-colors">
          <ChevronLeft size={16} /> Back to lots
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lot Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{lot.name}</h1>
                  <p className="text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14} />{lot.address}, {lot.city}</p>
                </div>
                {pricingEst && (
                  <span className={cn("text-sm px-3 py-1 rounded-full border font-semibold", getPricingTierColor(pricingEst.pricingTier))}>
                    {getPricingTierLabel(pricingEst.pricingTier)}
                  </span>
                )}
              </div>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1 text-slate-600"><Star size={14} className="text-amber-400 fill-amber-400" />{lot.rating.toFixed(1)}</span>
                <span className="flex items-center gap-1 text-slate-600"><Car size={14} />{lot.totalSlots} total slots</span>
                <span className={cn("font-semibold", lot.availableSlots > 0 ? "text-emerald-600" : "text-red-600")}>
                  {lot.availableSlots} available
                </span>
              </div>
              <div className="mt-3">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", (availability?.occupancyPercent ?? 0) > 80 ? "bg-red-500" : (availability?.occupancyPercent ?? 0) > 60 ? "bg-amber-500" : "bg-emerald-500")}
                    style={{ width: `${availability?.occupancyPercent ?? 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0%</span>
                  <span>{availability?.occupancyPercent ?? 0}% occupied</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {((lot.amenities ?? []) as string[]).map((a) => (
                  <span key={a} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a}</span>
                ))}
              </div>
            </div>

            {/* Slot Map */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-3">Slot Map</h2>
              <div className="flex flex-wrap gap-1.5">
                {slots.map((slot) => {
                  const Icon = SLOT_TYPE_ICONS[slot.type] ?? Car;
                  return (
                    <div
                      key={slot.id}
                      title={`${slot.slotNumber} (${slot.type}) — ${slot.status}`}
                      className={cn(
                        "w-10 h-10 rounded-lg border flex flex-col items-center justify-center cursor-default transition-all",
                        slot.status === "available" ? "bg-emerald-50 border-emerald-300 text-emerald-700" :
                          slot.status === "occupied" ? "bg-gray-100 border-gray-300 text-gray-400" :
                            slot.status === "reserved" ? "bg-amber-50 border-amber-300 text-amber-600" :
                              "bg-purple-50 border-purple-200 text-purple-400"
                      )}
                    >
                      <Icon size={14} />
                      <span className="text-[9px] font-medium leading-none mt-0.5">{slot.slotNumber}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 flex-wrap">
                {[
                  { color: "bg-emerald-400", label: "Available" },
                  { color: "bg-amber-400", label: "Reserved" },
                  { color: "bg-gray-300", label: "Occupied" },
                  { color: "bg-purple-300", label: "Maintenance" },
                ].map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={cn("w-2.5 h-2.5 rounded-full", item.color)} />{item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-20">
              <h2 className="font-semibold text-slate-900 mb-4">Book & Pay</h2>

              {paymentDone ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-semibold text-emerald-700">Payment successful!</p>
                  <p className="text-sm text-slate-500 mt-1">Redirecting to your bookings...</p>
                </div>
              ) : (
                <form onSubmit={handleBook} className="space-y-3">
                  {bookingError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{bookingError}</div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle Plate</label>
                    <input
                      type="text" value={vehiclePlate} required
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] uppercase"
                      placeholder="DL 01 AB 1234"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle Type</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["car", "motorcycle", "ev"] as const).map((t) => (
                        <button type="button" key={t} onClick={() => setVehicleType(t)}
                          className={cn("py-1.5 text-xs font-medium rounded-lg border transition-all capitalize", vehicleType === t ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "border-slate-300 text-slate-600 hover:border-[#1e3a5f]")}>
                          {t === "ev" ? "EV" : t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Booking Type</label>
                    <select value={bookingType} onChange={(e) => setBookingType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
                    <input type="datetime-local" value={startTime} min={addHours(0)}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Duration: {duration} hours</label>
                    <input type="range" min={1} max={24} value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full accent-[#1e3a5f]" />
                    <div className="flex justify-between text-xs text-slate-400 mt-0.5"><span>1h</span><span>24h</span></div>
                  </div>

                  {pricingEst && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Base rate</span>
                        <span>{formatCurrency(pricingEst.baseRate)}/hr</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Time multiplier</span>
                        <span>{pricingEst.timeMultiplier}x</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Demand multiplier</span>
                        <span>{pricingEst.demandMultiplier}x</span>
                      </div>
                      <div className="border-t border-slate-200 pt-1 flex justify-between font-semibold text-[#1e3a5f]">
                        <span>Estimated Total</span>
                        <span>{formatCurrency(pricingEst.estimatedTotal)}</span>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={createBooking.isPending || lot.availableSlots === 0}
                    className="w-full bg-amber-400 text-[#1e3a5f] font-bold py-2.5 rounded-lg hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {createBooking.isPending ? <Loader2 size={16} className="animate-spin" /> : <Car size={16} />}
                    {lot.availableSlots === 0 ? "No Slots Available" : "Book & Pay"}
                  </button>

                  {!user && (
                    <p className="text-xs text-center text-slate-500">
                      <Link href="/login" className="text-[#1e3a5f] font-semibold">Sign in</Link> to book
                    </p>
                  )}

                  <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current text-emerald-500"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                    Secured by Razorpay
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
