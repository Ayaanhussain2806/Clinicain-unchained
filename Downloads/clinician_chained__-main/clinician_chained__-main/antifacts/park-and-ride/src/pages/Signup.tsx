import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useSignup } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, UserPlus, Loader2 } from "lucide-react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", vehiclePlate: "", vehicleType: "car"
  });
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const { setAuth } = useAuth();
  const signupMutation = useSignup();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    signupMutation.mutate({ data: form }, {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        navigate("/");
      },
      onError: (err: any) => {
        setError(err?.data?.error ?? "Registration failed");
      },
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin size={22} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
          <p className="text-slate-500 mt-1">Join ParkRide for smarter commuting</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input name="name" type="text" required value={form.name} onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                placeholder="Priya Sharma" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input name="password" type="password" required minLength={6} value={form.password} onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                placeholder="Minimum 6 characters" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Vehicle Plate</label>
                <input name="vehiclePlate" type="text" value={form.vehiclePlate} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] uppercase"
                  placeholder="DL 01 AB 1234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Vehicle Type</label>
                <select name="vehicleType" value={form.vehicleType} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="ev">Electric Vehicle</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full bg-[#1e3a5f] text-white font-semibold py-2.5 rounded-lg hover:bg-[#2d5a8e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {signupMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {signupMutation.isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1e3a5f] font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
