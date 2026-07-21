import {
  ArrowLeft,
  ChevronDown,
  Clock,
  Gauge,
  Headphones,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Menu,
  Phone,
  Plug,
  ShieldCheck,
  Star,
  Sun,
  TrendingDown,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingDown,
  Zap,
  Headphones,
  LayoutDashboard,
  Plug,
  ShieldCheck,
  Gauge,
  Lightbulb,
  Sun,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Zap;
}

export {
  ArrowLeft,
  ChevronDown,
  Clock,
  Mail,
  Menu,
  Phone,
  ShieldCheck as Shield,
  Star,
  TrendingDown,
  X,
  Zap,
};
