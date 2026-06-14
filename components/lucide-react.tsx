import type { ReactElement, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  "aria-hidden"?: boolean;
};

function createGlyphIcon(glyph: string) {
  return function GlyphIcon({
    size = 24,
    className,
    ...props
  }: IconProps) {
    return (
      <svg
        aria-hidden={props["aria-hidden"]}
        className={className}
        fill="none"
        height={size}
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle cx="12" cy="12" fill="currentColor" opacity="0.12" r="10" />
        <text
          dominantBaseline="middle"
          fill="currentColor"
          fontFamily="system-ui, sans-serif"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
          x="12"
          y="12.2"
        >
          {glyph}
        </text>
      </svg>
    );
  };
}

export const ArrowDownRight = createGlyphIcon("↘");
export const ArrowUpRight = createGlyphIcon("↗");
export const BarChart3 = createGlyphIcon("▥");
export const Bell = createGlyphIcon("🔔");
export const Bike = createGlyphIcon("🚲");
export const Building2 = createGlyphIcon("▣");
export const Calculator = createGlyphIcon("⌘");
export const CarFront = createGlyphIcon("🚗");
export const Check = createGlyphIcon("✓");
export const CheckCircle2 = createGlyphIcon("◉");
export const Chrome = createGlyphIcon("◌");
export const Cloud = createGlyphIcon("☁");
export const Coins = createGlyphIcon("◍");
export const Copy = createGlyphIcon("⧉");
export const Flame = createGlyphIcon("🔥");
export const Globe2 = createGlyphIcon("🌐");
export const Home = createGlyphIcon("⌂");
export const Leaf = createGlyphIcon("🌿");
export const Lightbulb = createGlyphIcon("💡");
export const Mail = createGlyphIcon("✉");
export const MapPin = createGlyphIcon("📍");
export const Minus = createGlyphIcon("−");
export const MoveLeft = createGlyphIcon("←");
export const MoveRight = createGlyphIcon("→");
export const Moon = createGlyphIcon("☾");
export const Plus = createGlyphIcon("+");
export const Recycle = createGlyphIcon("♻");
export const RefreshCw = createGlyphIcon("↻");
export const Settings = createGlyphIcon("⚙");
export const Share2 = createGlyphIcon("↗");
export const ShieldCheck = createGlyphIcon("🛡");
export const ShoppingBag = createGlyphIcon("🛍");
export const Sprout = createGlyphIcon("🌱");
export const Sun = createGlyphIcon("☀");
export const Target = createGlyphIcon("◎");
export const TrainFront = createGlyphIcon("🚆");
export const Trophy = createGlyphIcon("🏆");
export const UserRound = createGlyphIcon("👤");
export const Users = createGlyphIcon("👥");
export const Utensils = createGlyphIcon("🍽");
export const WandSparkles = createGlyphIcon("✨");
export const Wifi = createGlyphIcon("📶");
export const Zap = createGlyphIcon("⚡");

export const Search = createGlyphIcon("🔍");
export const Scan = createGlyphIcon("⎚");
export const Mic = createGlyphIcon("🎤");
export const Send = createGlyphIcon("➤");
export const Star = createGlyphIcon("⭐");
export const ChevronUp = createGlyphIcon("︿");
export const ChevronDown = createGlyphIcon("﹀");
export const ShoppingCart = createGlyphIcon("🛒");
export const X = createGlyphIcon("✕");
export const Navigation = createGlyphIcon("🧭");
export const Map = createGlyphIcon("🗺");
export const HelpCircle = createGlyphIcon("❓");
export const CheckCircle = createGlyphIcon("✅");
export const Download = createGlyphIcon("📥");
export const TrendingDown = createGlyphIcon("📉");
export const AlertCircle = createGlyphIcon("⚠");
export const Sparkles = createGlyphIcon("✨");
export const ArrowRight = createGlyphIcon("➔");
export const User = createGlyphIcon("👤");
export const Phone = createGlyphIcon("📞");
export const CreditCard = createGlyphIcon("💳");
export const Truck = createGlyphIcon("🚚");
export const Package = createGlyphIcon("📦");

export type LucideIcon = (props: IconProps) => ReactElement;
