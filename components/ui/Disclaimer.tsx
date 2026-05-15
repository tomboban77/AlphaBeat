import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclaimerProps {
  variant?: "compact" | "block";
  className?: string;
  children?: React.ReactNode;
}

const BLOCK_TEXT =
  "AlphaBeat is an educational publication for Canadian individual investors. Nothing on this site is investment advice or a solicitation to buy, sell, or hold any security. AlphaBeat is not a registered investment adviser under IIROC, the OSC, or any provincial securities regulator. Stock scores, quotes, and editorial content reflect publicly available information and the author's opinions — they may be inaccurate, incomplete, or out of date. Verify all figures with your broker before acting. Past performance does not predict future results. Sponsored placements, when present, are clearly labelled and do not constitute an endorsement.";

const COMPACT_TEXT =
  "Educational only — not investment advice. Not a registered adviser. Verify with your broker before acting.";

export default function Disclaimer({
  variant = "compact",
  className,
  children,
}: DisclaimerProps) {
  if (variant === "compact") {
    return (
      <p
        className={cn(
          "inline-flex items-start gap-1.5 text-xs leading-relaxed text-ash-500",
          className
        )}
      >
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>{children || COMPACT_TEXT}</span>
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-warn-500/20 bg-warn-500/5 p-4 text-xs leading-relaxed text-warn-200/80",
        className
      )}
      role="note"
      aria-label="Investment disclaimer"
    >
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-warn-300" aria-hidden />
        <p>{children || BLOCK_TEXT}</p>
      </div>
    </div>
  );
}
