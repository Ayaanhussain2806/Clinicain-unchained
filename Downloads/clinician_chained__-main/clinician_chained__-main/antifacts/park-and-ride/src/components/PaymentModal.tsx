import { useState } from "react";
import { X, Loader2, CreditCard, ShieldCheck, IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentModalProps {
  bookingId: number;
  amount: number;
  lotName: string;
  slotNumber: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentModal({ bookingId, amount, lotName, slotNumber, onSuccess, onClose }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load payment gateway. Check your internet connection.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("park_token");

    let orderData: { orderId: string; amount: number; currency: string; keyId: string };
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bookingId, amount }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create payment order");
      }
      orderData = await res.json();
    } catch (err: any) {
      setError(err.message ?? "Failed to initiate payment");
      setLoading(false);
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "ParkRide",
      description: `Parking at ${lotName} — Slot ${slotNumber}`,
      order_id: orderData.orderId,
      theme: { color: "#1e3a5f" },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId,
            }),
          });

          if (!verifyRes.ok) throw new Error("Payment verification failed");
          onSuccess(response.razorpay_payment_id);
        } catch {
          setError("Payment was received but verification failed. Please contact support.");
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      setError(`Payment failed: ${response.error?.description ?? "Unknown error"}`);
      setLoading(false);
    });
    rzp.open();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-[#1e3a5f] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold">
            <CreditCard size={18} />
            Complete Payment
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Parking at</span>
              <span className="font-medium text-slate-900">{lotName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Slot</span>
              <span className="font-medium text-slate-900">{slotNumber}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-[#1e3a5f]">
              <span className="flex items-center gap-1"><IndianRupee size={14} />Total Amount</span>
              <span className="text-lg">{formatCurrency(amount)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#1e3a5f] text-white font-bold py-3.5 rounded-xl hover:bg-[#2d5a8e] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed text-base"
          >
            {loading ? (
              <><Loader2 size={20} className="animate-spin" /> Processing...</>
            ) : (
              <><CreditCard size={20} /> Pay {formatCurrency(amount)}</>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            Secured by Razorpay · 256-bit SSL encryption
          </div>
        </div>
      </div>
    </div>
  );
}
