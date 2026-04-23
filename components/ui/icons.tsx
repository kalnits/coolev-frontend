import {
  Home,
  Footprints,
  Dog,
  Cat,
  Baby,
  MapPin,
  Star,
  Heart,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  User,
  Users,
  Settings,
  LogOut,
  LogIn,
  Mail,
  Phone,
  Camera,
  Image,
  Edit,
  Trash2,
  Plus,
  Minus,
  Search,
  Filter,
  SlidersHorizontal,
  Menu,
  MoreHorizontal,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  Shield,
  Award,
  Verified,
  Building,
  Car,
  Globe,
  Bone,
  PawPrint,
  type LucideIcon,
} from "lucide-react";

// Icon name to component mapping
const iconMap = {
  // Services
  home: Home,
  boarding: Home,
  walking: Footprints,
  footprints: Footprints,

  // Animals
  dog: Dog,
  "dog-small": Dog,
  "dog-medium": Dog,
  "dog-large": Dog,
  cat: Cat,
  paw: PawPrint,
  bone: Bone,

  // People
  baby: Baby,
  kids: Baby,
  user: User,
  users: Users,

  // Location
  "map-pin": MapPin,
  location: MapPin,
  building: Building,
  car: Car,
  globe: Globe,

  // Actions
  star: Star,
  heart: Heart,
  check: Check,
  close: X,
  edit: Edit,
  delete: Trash2,
  plus: Plus,
  minus: Minus,
  search: Search,
  filter: Filter,
  sliders: SlidersHorizontal,
  menu: Menu,
  more: MoreHorizontal,
  external: ExternalLink,
  camera: Camera,
  image: Image,

  // Navigation
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,

  // Time
  calendar: Calendar,
  clock: Clock,

  // Auth
  "log-out": LogOut,
  "log-in": LogIn,
  mail: Mail,
  phone: Phone,
  settings: Settings,

  // Status
  alert: AlertCircle,
  success: CheckCircle,
  info: Info,

  // Trust/Quality
  sparkles: Sparkles,
  shield: Shield,
  award: Award,
  verified: Verified,
} as const;

export type IconName = keyof typeof iconMap;

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 20, className = "", strokeWidth = 2 }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(`[v0] Icon "${name}" not found in icon map`);
    return null;
  }
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
}

// Convenience wrapper for picker card icons with consistent styling
type PickerIconProps = {
  name: IconName;
  variant?: "default" | "active";
};

export function PickerIcon({ name, variant = "default" }: PickerIconProps) {
  return (
    <span className={`picker-icon ${variant === "active" ? "picker-icon-active" : ""}`}>
      <Icon name={name} size={18} strokeWidth={1.75} />
    </span>
  );
}

// For direct component access when needed
export { iconMap };
export type { LucideIcon };
