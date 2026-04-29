import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function getPricingTierColor(tier: string): string {
  switch (tier) {
    case "off_peak": return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "standard": return "text-blue-600 bg-blue-50 border-blue-200";
    case "peak": return "text-orange-600 bg-orange-50 border-orange-200";
    case "surge": return "text-red-600 bg-red-50 border-red-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getPricingTierLabel(tier: string): string {
  switch (tier) {
    case "off_peak": return "Off-Peak";
    case "standard": return "Standard";
    case "peak": return "Peak";
    case "surge": return "Surge";
    default: return tier;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active": case "confirmed": case "available": return "text-emerald-700 bg-emerald-100";
    case "completed": case "in_progress": return "text-blue-700 bg-blue-100";
    case "cancelled": case "no_show": return "text-red-700 bg-red-100";
    case "reserved": return "text-amber-700 bg-amber-100";
    case "occupied": return "text-gray-700 bg-gray-200";
    case "maintenance": return "text-purple-700 bg-purple-100";
    case "requested": return "text-indigo-700 bg-indigo-100";
    default: return "text-gray-700 bg-gray-100";
  }
}
