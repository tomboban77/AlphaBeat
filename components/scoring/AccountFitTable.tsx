import { cn } from "@/lib/utils";
import type { AccountFit, AccountFitRec } from "@/lib/types";

interface AccountFitTableProps {
  accountFit?: AccountFit;
}

const ACCOUNTS: { key: keyof AccountFit; label: string; abbr: string }[] = [
  { key: "tfsa", label: "TFSA", abbr: "Tax-Free Savings Account" },
  { key: "rrsp", label: "RRSP", abbr: "Registered Retirement Savings Plan" },
  { key: "fhsa", label: "FHSA", abbr: "First Home Savings Account" },
  { key: "nonRegistered", label: "Non-reg", abbr: "Non-registered account" },
];

const REC_CONFIG: Record<AccountFitRec, { label: string; className: string; symbol: string }> = {
  ideal:      { label: "Ideal",      symbol: "✓✓", className: "bg-up-500/15 text-up-300 ring-up-500/30" },
  good:       { label: "Good",       symbol: "✓",  className: "bg-accent-500/15 text-accent-300 ring-accent-500/30" },
  acceptable: { label: "OK",         symbol: "~",  className: "bg-ink-700 text-ash-400 ring-ink-600" },
  avoid:      { label: "Avoid",      symbol: "✗",  className: "bg-down-500/10 text-down-400 ring-down-500/25" },
};

function RecPill({ rec }: { rec?: AccountFitRec }) {
  if (!rec) return <span className="text-xs text-ash-600">—</span>;
  const cfg = REC_CONFIG[rec];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        cfg.className
      )}
      aria-label={cfg.label}
    >
      <span aria-hidden>{cfg.symbol}</span>
      {cfg.label}
    </span>
  );
}

export default function AccountFitTable({ accountFit }: AccountFitTableProps) {
  if (!accountFit) {
    return (
      <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">Account fit</div>
        <p className="mt-2 text-sm text-ash-500">Pending editor review.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800/40 p-5 sm:p-6">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ash-400">
        Account fit
      </div>
      <table className="w-full text-sm" role="table">
        <caption className="sr-only">Which account is best for holding this stock</caption>
        <thead>
          <tr className="border-b border-ink-700">
            <th scope="col" className="pb-2 text-left text-xs font-medium text-ash-500">Account</th>
            <th scope="col" className="pb-2 text-left text-xs font-medium text-ash-500">Fit</th>
            <th scope="col" className="pb-2 text-left text-xs font-medium text-ash-500">Why</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-800">
          {ACCOUNTS.map(({ key, label, abbr }) => {
            const entry = accountFit[key];
            return (
              <tr key={key}>
                <td className="py-3 pr-4 align-top">
                  <span className="font-semibold text-ash-100" title={abbr}>{label}</span>
                </td>
                <td className="py-3 pr-4 align-top">
                  <RecPill rec={entry?.recommendation} />
                </td>
                <td className="py-3 align-top text-xs leading-relaxed text-ash-400">
                  {entry?.reasoning || <span className="text-ash-600">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] text-ash-600">
        Ideal = best tax outcome · Avoid = material drag or ineligible ·
        Color and symbol, not color alone, indicate fit.
      </p>
    </div>
  );
}
