import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { mark: "h-6 w-6", wordmark: "text-base" },
  md: { mark: "h-7 w-7", wordmark: "text-lg" },
  lg: { mark: "h-9 w-9", wordmark: "text-2xl" },
};

export default function Logo({ size = "md", className }: LogoProps) {
  const s = sizes[size];
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="AlphaBeat home"
    >
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-md bg-gradient-to-br from-accent-400 to-accent-600 text-ink-950 shadow-md shadow-accent-600/30",
          s.mark
        )}
      >
        <svg viewBox="0 0 20 20" className="h-3/5 w-3/5" fill="none">
          <path
            d="M2 14 L7 8 L11 12 L18 4"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className={cn("font-semibold tracking-tight text-ash-50", s.wordmark)}>
        Alpha<span className="text-accent-400">Beat</span>
      </span>
    </Link>
  );
}
