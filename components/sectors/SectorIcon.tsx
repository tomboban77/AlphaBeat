import {
  Activity, Atom, Banknote, Battery, Bitcoin, Bolt, Building2, Car,
  Cpu, Cross, DollarSign, Drama, Factory, Flame, Gem, Globe, GraduationCap,
  Hammer, HeartPulse, Home, Laptop, Leaf, Microscope, Moon, Pill,
  Plane, Pickaxe, Rocket, ShieldCheck, ShoppingBag, Stethoscope, Sun,
  Tractor, Tv, TrendingUp, Trees, Truck, Wrench, Wifi, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  activity: Activity, atom: Atom, banknote: Banknote, battery: Battery,
  bitcoin: Bitcoin, bolt: Bolt, building2: Building2, car: Car, cpu: Cpu,
  cross: Cross, "dollar-sign": DollarSign, drama: Drama, factory: Factory,
  flame: Flame, gem: Gem, globe: Globe, "graduation-cap": GraduationCap,
  hammer: Hammer, "heart-pulse": HeartPulse, home: Home, laptop: Laptop,
  leaf: Leaf, microscope: Microscope, moon: Moon, pill: Pill, plane: Plane,
  pickaxe: Pickaxe, rocket: Rocket, "shield-check": ShieldCheck,
  "shopping-bag": ShoppingBag, stethoscope: Stethoscope, sun: Sun,
  tractor: Tractor, tv: Tv, "trending-up": TrendingUp, trees: Trees,
  truck: Truck, wrench: Wrench, wifi: Wifi, zap: Zap,
};

interface SectorIconProps {
  icon?: string;
  className?: string;
}

export default function SectorIcon({ icon, className }: SectorIconProps) {
  if (!icon) return <TrendingUp className={className} />;
  // Emoji fallback
  if (/\p{Emoji}/u.test(icon)) {
    return <span className={className}>{icon}</span>;
  }
  const key = icon.trim().toLowerCase();
  const Icon = ICONS[key] || TrendingUp;
  return <Icon className={className} />;
}

export const ACCENT_RING: Record<string, string> = {
  cyan: "ring-accent-500/30 bg-accent-500/10 text-accent-300",
  emerald: "ring-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  violet: "ring-violet-500/30 bg-violet-500/10 text-violet-300",
  amber: "ring-amber-500/30 bg-amber-500/10 text-amber-300",
  rose: "ring-rose-500/30 bg-rose-500/10 text-rose-300",
  sky: "ring-sky-500/30 bg-sky-500/10 text-sky-300",
  lime: "ring-lime-500/30 bg-lime-500/10 text-lime-300",
  fuchsia: "ring-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
};

export const ACCENT_BORDER: Record<string, string> = {
  cyan: "border-accent-500/40",
  emerald: "border-emerald-500/40",
  violet: "border-violet-500/40",
  amber: "border-amber-500/40",
  rose: "border-rose-500/40",
  sky: "border-sky-500/40",
  lime: "border-lime-500/40",
  fuchsia: "border-fuchsia-500/40",
};
