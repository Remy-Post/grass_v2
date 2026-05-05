import {
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  Flower,
  Flower2,
  HelpCircle,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Plus,
  Scissors,
  ShieldCheck,
  ShieldX,
  Snowflake,
  Sparkles,
  Sprout,
  Sun,
  ThumbsUp,
  Tractor,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';

// Lucide doesn't ship a "Mower" icon yet; Tractor stands in for now.
// Swap to a custom SVG in Phase 2 if Remy wants a more literal mower glyph.
const iconMap = {
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  Flower,
  Flower2,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Mower: Tractor,
  Plus,
  Scissors,
  ShieldCheck,
  ShieldX,
  Snowflake,
  Sparkles,
  Sprout,
  Sun,
  ThumbsUp,
  Tractor,
  UserRound,
  X,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;

export function getIcon(name: string | undefined | null): LucideIcon {
  if (!name) return HelpCircle;
  return iconMap[name as IconName] ?? HelpCircle;
}

export function isKnownIcon(name: string): name is IconName {
  return name in iconMap;
}

export const ALL_ICON_NAMES = Object.keys(iconMap) as IconName[];
