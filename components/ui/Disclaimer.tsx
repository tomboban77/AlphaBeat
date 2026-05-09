import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclaimerProps {
  variant?: "compact" | "block";
  className?: string;
  children?: React.ReactNode;
}

export default function Disclaimer({
  variant = "compact",
  className,
  children,
}: DisclaimerProps) {
  const text =
    children ||
    "Educational only. Not investment advice. Quotes may be delayed. Always do your own research.";
  if (variant === "compact") {
    return (
      <p
        className={cn(
          "inline-flex items-start gap-1.5 text-xs leading-relaxed text-ash-500",
          className
        )}
      >
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{text}</span>
      </p>
    );
  }
  return (
    <div
      className={cn(
        "rounded-xl border border-warn-500/30 bg-warn-500/5 p-4 text-sm leading-relaxed text-warn-200",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-warn-300" />
        <div>{text}</div>
      </div>
    </div>
  );
}
