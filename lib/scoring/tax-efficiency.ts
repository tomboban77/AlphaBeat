/**
 * lib/scoring/tax-efficiency.ts  — Canadian Tax Efficiency factor (weight ~15%)
 *
 * Rule-based. No Finnhub data needed — determined entirely from the
 * stockFile fields (exchange, sectorLabel) and whether a dividend is paid.
 *
 * Score = base (50) + adjustment:
 *
 *   Canadian-listed (TSX/TSXV) eligible dividend payer
 *     Best account: TFSA or non-registered → +30 = 80
 *     Rationale: eligible dividend tax credit maximised; no withholding in TFSA
 *
 *   US-listed dividend payer
 *     Best account: RRSP → 0 adjustment = 50  (US-Canada tax treaty exempts withholding)
 *     In TFSA: –20 = 30  (15% IRS withholding not recoverable)
 *     We report the RRSP score (50) as baseline — the Account Fit table shows the TFSA penalty
 *
 *   Canadian REIT (TSX/TSXV, sectorLabel contains "REIT")
 *     Distributions are largely return of capital / other income, not eligible dividends
 *     Non-registered: –10 = 40  (lose the eligible dividend credit)
 *     Registered (TFSA/RRSP): 0 adjustment = 50
 *     We report 50 as baseline (assume held in registered account)
 *
 *   Non-dividend growth stock (any exchange)
 *     50 baseline — tax treatment depends only on account type, no dividend drag
 *     Canadian-listed growth: slight edge (+5) because no withholding risk = 55
 *     US-listed growth: 50 (TFSA growth is tax-free but no withholding advantage)
 *
 * Score summary table:
 *   Canadian dividend (TSX/TSXV) → 80
 *   Canadian REIT (TSX/TSXV)     → 50
 *   Canadian growth (TSX/TSXV)   → 55
 *   US dividend (NYSE/NASDAQ)    → 50  (RRSP best)
 *   US growth (NYSE/NASDAQ)      → 50
 */

import type { FactorScore } from "@/lib/types";

interface TaxInputs {
  exchange: string;          // TSX | TSXV | NYSE | NASDAQ
  sectorLabel: string;
  dividendYield?: number;    // indicated annual % from Finnhub (0 = no dividend)
}

export function computeTaxEfficiency(inputs: TaxInputs): FactorScore {
  const { exchange, sectorLabel, dividendYield } = inputs;
  const isCanadian = exchange === "TSX" || exchange === "TSXV";
  const isReit     = /reit/i.test(sectorLabel);
  const paysDividend = dividendYield != null && dividendYield > 0.5; // >0.5% = meaningful yield

  let score: number;

  if (isCanadian && isReit) {
    score = 50;  // REIT — non-eligible distributions, best in registered
  } else if (isCanadian && paysDividend) {
    score = 80;  // Eligible dividends in TFSA — maximum Canadian tax advantage
  } else if (isCanadian && !paysDividend) {
    score = 55;  // Canadian growth stock — minor edge (no withholding risk)
  } else if (!isCanadian && paysDividend) {
    score = 50;  // US dividend in RRSP (treaty) — acceptable, but TFSA is suboptimal
  } else {
    score = 50;  // US growth — neutral
  }

  return { value: score, label: String(score), insufficient: false, overridden: false };
}
