import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Car, MapPin, BookOpen, Bike, TrendingUp, LayoutDashboard, LogOut, LogIn, UserPlus, Wifi, WifiOff } from "lucide-react";
import { isOnline } from "@/lib/offline";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
  authRequired?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/lots", label: "Parking", icon: <Car size={18} /> },
  { href: "/bookings", label: "Bookings", icon: <BookOpen size={18} />, authRequired: true },
  { href: "/rides", label: "Rides", icon: <Bike size={18} />, authRequired: true },
  { href: "/pricing", label: "Pricing", icon: <TrendingUp size={18} /> },
  { href: "/admin", label: "Admin", icon: <LayoutDashboard size={18} />, adminOnly: true },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const [location] = useLocation();
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  const visibleNav = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.authRequired) return !!user;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Offline Banner */}
      {!online && (
        <div className="bg-amber-500 text-white text-sm text-center py-1.5 px-4 flex items-center justify-center gap-2">
          <WifiOff size={14} />
          You are offline. Showing saved bookings only.
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1e3a5f] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-[#1e3a5f]" />
            </div>
            <span>ParkRide</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  location === item.href || location.startsWith(item.href + "/")
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", online ? "bg-emerald-400" : "bg-amber-400")} title={online ? "Online" : "Offline"} />
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80 hidden md:block">{user.name}</span>
                {user.role === "admin" && <span className="text-xs bg-amber-400 text-[#1e3a5f] px-1.5 py-0.5 rounded font-semibold">Admin</span>}
                <button onClick={logout} className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all">
                  <LogOut size={16} />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/login" className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all">
                  <LogIn size={16} />
                  <span className="hidden md:inline">Login</span>
                </Link>
                <Link href="/signup" className="flex items-center gap-1.5 text-sm bg-amber-400 text-[#1e3a5f] font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-all">
                  <UserPlus size={14} />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden border-t border-white/10 px-4 pb-2 flex gap-1 overflow-x-auto">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                location === item.href
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-[#1e3a5f] text-white/50 text-center text-xs py-3">
        Smart Park & Ride System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
