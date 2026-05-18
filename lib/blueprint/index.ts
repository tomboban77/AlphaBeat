// ============================================================
// AlphaBeat Blueprint engine
// ============================================================

// ---- Types ----

export type Goal = "home" | "retire" | "wealth" | "start";
export type IncomeRange = "under50" | "50to80" | "80to120" | "over120";
export type InvestAmount = "under1k" | "1to5k" | "5to25k" | "25to100k" | "over100k";
export type MonthlySavings = "none" | "100to250" | "250to500" | "500to1k" | "over1k";
export type InvestStyle = "income" | "balanced" | "growth";

export interface BlueprintInputs {
  birthYear: number;
  goal: Goal;
  income: IncomeRange;
  investAmount: InvestAmount;
  monthlySavings: MonthlySavings;
  style: InvestStyle;
}

export interface PortfolioHolding {
  ticker: string;
  isETF: boolean;
  companyName: string;
  slug: string;
  sector: string;
  allocationPct: number;
  allocationAmt: number;
  score: number | null;
  fiveYearReturn: number;
  dividendYield?: number;
  consecutiveDivGrowthYrs?: number;
  rationale: string;
}

export interface AccountPlan {
  primary: "TFSA" | "RRSP" | "FHSA";
  secondary?: "RRSP" | "TFSA";
  tfsaRoom: number;
  fhsaEligible: boolean;
  reasoning: string;
}

export interface GrowthProjection {
  lumpSum: number;
  monthly: number;
  annualRate: number;
  yr10: number;
  yr20: number;
  yr30: number;
}

export interface Blueprint {
  profileLabel: string;
  age: number;
  broker: "wealthsimple" | "questrade" | "both";
  brokerReason: string;
  accountPlan: AccountPlan;
  holdings: PortfolioHolding[];
  projection: GrowthProjection;
  playbookSlug?: string;
  playbookTitle?: string;
  smallAmountNote?: string;
}

// ---- TFSA Room ----

const TFSA_ANNUAL: Record<number, number> = {
  2009: 5000, 2010: 5000, 2011: 5000, 2012: 5000,
  2013: 5500, 2014: 5500, 2015: 10000, 2016: 5500,
  2017: 5500, 2018: 5500, 2019: 6000, 2020: 6000,
  2021: 6000, 2022: 6000, 2023: 6500, 2024: 7000,
  2025: 7000, 2026: 7000,
};

export function calcTFSARoom(birthYear: number): number {
  const firstYear = Math.max(birthYear + 18, 2009);
  return Object.entries(TFSA_ANNUAL)
    .filter(([y]) => +y >= firstYear && +y <= 2026)
    .reduce((sum, [, v]) => sum + v, 0);
}

// ---- Representative $ values ----

const LUMP_MAP: Record<InvestAmount, number> = {
  under1k: 750,
  "1to5k": 3000,
  "5to25k": 10000,
  "25to100k": 50000,
  over100k: 100000,
};

const MONTHLY_MAP: Record<MonthlySavings, number> = {
  none: 0,
  "100to250": 175,
  "250to500": 375,
  "500to1k": 750,
  over1k: 1250,
};

function fvCalc(principal: number, monthly: number, annualRate: number, years: number): number {
  if (annualRate === 0) return Math.round(principal + monthly * 12 * years);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  const fvLump = principal * Math.pow(1 + r, n);
  if (monthly === 0) return Math.round(fvLump);
  const fvMonthly = monthly * ((Math.pow(1 + r, n) - 1) / r);
  return Math.round(fvLump + fvMonthly);
}

// ---- Stock universe ----

interface StockDef {
  ticker: string;
  isETF: boolean;
  companyName: string;
  slug: string;
  sector: string;
  score: number | null;
  fiveYearReturn: number;
  dividendYield?: number;
  consecutiveDivGrowthYrs?: number;
}

const STOCKS: Record<string, StockDef> = {
  RY: {
    ticker: "RY.TO", isETF: false, companyName: "Royal Bank of Canada",
    slug: "royal-bank-of-canada", sector: "Canadian Banks",
    score: 81, fiveYearReturn: 52, dividendYield: 3.8, consecutiveDivGrowthYrs: 14,
  },
  ENB: {
    ticker: "ENB.TO", isETF: false, companyName: "Enbridge Inc.",
    slug: "enbridge", sector: "Energy Infrastructure",
    score: 72, fiveYearReturn: 44, dividendYield: 7.1,
  },
  FTS: {
    ticker: "FTS.TO", isETF: false, companyName: "Fortis Inc.",
    slug: "fortis", sector: "Utilities",
    score: 70, fiveYearReturn: 28, dividendYield: 3.6, consecutiveDivGrowthYrs: 51,
  },
  CNQ: {
    ticker: "CNQ.TO", isETF: false, companyName: "Canadian Natural Resources",
    slug: "canadian-natural-resources", sector: "Energy",
    score: 74, fiveYearReturn: 142, dividendYield: 4.5, consecutiveDivGrowthYrs: 10,
  },
  SHOP: {
    ticker: "SHOP.TO", isETF: false, companyName: "Shopify Inc.",
    slug: "shopify", sector: "Technology",
    score: 68, fiveYearReturn: 89,
  },
  CSU: {
    ticker: "CSU.TO", isETF: false, companyName: "Constellation Software",
    slug: "constellation-software", sector: "Technology",
    score: 75, fiveYearReturn: 178,
  },
  AEM: {
    ticker: "AEM.TO", isETF: false, companyName: "Agnico Eagle Mines",
    slug: "agnico-eagle-mines", sector: "Precious Metals",
    score: 72, fiveYearReturn: 130, dividendYield: 1.8,
  },
  WCN: {
    ticker: "WCN.TO", isETF: false, companyName: "Waste Connections Inc.",
    slug: "waste-connections", sector: "Industrials",
    score: 71, fiveYearReturn: 95, dividendYield: 0.7,
  },
  XEQT: {
    ticker: "XEQT.TO", isETF: true, companyName: "iShares Core Equity ETF Portfolio",
    slug: "", sector: "Global Equities",
    score: null, fiveYearReturn: 82,
  },
};

// ---- Portfolio templates ----
// Three tiers per style: [0] under1k  [1] 1to5k  [2] 5to25k+

interface Alloc { key: string; pct: number; rationale: string }

const PORTFOLIOS: Record<InvestStyle, Alloc[][]> = {
  income: [
    // Tier 0 — under $1K: 2 picks
    [
      { key: "RY", pct: 60, rationale: "Canada's most profitable bank — 14 consecutive years of dividend growth at 7%/yr. At 3.8% yield, the income compounds completely tax-free inside your TFSA." },
      { key: "ENB", pct: 40, rationale: "North America's largest pipeline network. The 7.1% dividend is backed by long-term regulated contracts, not commodity prices — so income holds up regardless of what oil does." },
    ],
    // Tier 1 — $1K–$5K: 3 picks
    [
      { key: "RY", pct: 40, rationale: "Canada's most profitable bank — 14 consecutive years of dividend growth at 7%/yr. At 3.8% yield, the income compounds completely tax-free inside your TFSA." },
      { key: "ENB", pct: 35, rationale: "North America's largest pipeline network. The 7.1% dividend is backed by long-term regulated contracts, not commodity prices — so income holds up regardless of what oil does." },
      { key: "FTS", pct: 25, rationale: "51 consecutive years of dividend growth — the longest streak of any Canadian company. Utilities that supply electricity and gas to homes rarely have difficult years." },
    ],
    // Tier 2 — $5K+: same 3 picks, same weights
    [
      { key: "RY", pct: 40, rationale: "Canada's most profitable bank — 14 consecutive years of dividend growth at 7%/yr. At 3.8% yield, the income compounds completely tax-free inside your TFSA." },
      { key: "ENB", pct: 35, rationale: "North America's largest pipeline network. The 7.1% dividend is backed by long-term regulated contracts, not commodity prices — so income holds up regardless of what oil does." },
      { key: "FTS", pct: 25, rationale: "51 consecutive years of dividend growth — the longest streak of any Canadian company. Utilities that supply electricity and gas to homes rarely have difficult years." },
    ],
  ],
  balanced: [
    // Tier 0 — under $1K: 2 picks
    [
      { key: "RY", pct: 55, rationale: "Your income anchor. Canada's most profitable bank provides a steady 3.8% dividend while you build your portfolio up to a point where individual picks make more sense." },
      { key: "XEQT", pct: 45, rationale: "9,500 stocks across 50 countries for 0.20%/yr. The right foundation while you're building — you own a piece of almost every major company on the planet." },
    ],
    // Tier 1 — $1K–$5K: 3 picks
    [
      { key: "RY", pct: 35, rationale: "Your income anchor. Canada's most profitable bank provides steady dividends while the growth picks compound in the background." },
      { key: "CNQ", pct: 35, rationale: "The best-performing large-cap on the TSX over 5 years at +142%. Low breakeven oil costs mean strong returns even in down cycles. Dividend has grown 400%+ in a decade." },
      { key: "XEQT", pct: 30, rationale: "Your global diversifier — 9,500 stocks for 0.20%/yr. Smooths out the concentration risk of individual picks and keeps pace with world markets." },
    ],
    // Tier 2 — $5K+: 5 picks
    [
      { key: "RY", pct: 25, rationale: "Your income anchor. Canada's most profitable bank provides steady dividends while the growth picks compound in the background." },
      { key: "CNQ", pct: 25, rationale: "The best-performing large-cap on the TSX over 5 years at +142%. Low breakeven oil costs mean strong returns even in down cycles. Dividend has grown 400%+ in a decade." },
      { key: "SHOP", pct: 20, rationale: "Canada's global tech platform — powering 10% of US e-commerce. Refocused on profitability since 2022, with a large runway still ahead in payments and international markets." },
      { key: "WCN", pct: 15, rationale: "Quietly one of the best compounders in North America. Waste is recession-proof, and Waste Connections has beaten the S&P 500 for 15 years by rolling up small regional waste operators." },
      { key: "XEQT", pct: 15, rationale: "Your global safety net — 9,500 stocks for 0.20%/yr. Even when individual picks are volatile, XEQT keeps growing with world markets." },
    ],
  ],
  growth: [
    // Tier 0 — under $1K: 2 picks
    [
      { key: "CNQ", pct: 60, rationale: "The TSX's top-performing large-cap over the past 5 years at +142%. Canada's most efficient oil producer — low costs, decades of reserves, and a dividend that's grown 400%+ in a decade." },
      { key: "XEQT", pct: 40, rationale: "Your foundation while you build up capital. Pairing a high-conviction pick with broad global exposure is smart risk management at this portfolio size." },
    ],
    // Tier 1 — $1K–$5K: 3 picks
    [
      { key: "CNQ", pct: 40, rationale: "The TSX's top-performing large-cap over the past 5 years at +142%. Low breakeven costs, decades of reserves, and a dividend growing 400%+ in a decade." },
      { key: "SHOP", pct: 35, rationale: "Canada's global technology company. Shopify powers 10% of US e-commerce and is still in the early stages of its payments, banking, and international expansion story." },
      { key: "XEQT", pct: 25, rationale: "Your diversification floor — 9,500 global stocks protect your portfolio while you concentrate in your two highest-conviction ideas." },
    ],
    // Tier 2 — $5K+: 5 picks
    [
      { key: "CNQ", pct: 25, rationale: "The TSX's top-performing large-cap over 5 years at +142%. Canada's most efficient oil producer with low breakeven costs and decades of proven reserves ahead of it." },
      { key: "CSU", pct: 20, rationale: "One of the world's best compounders. Constellation buys essential niche software businesses and never sells them — up +17,000% since its 2006 IPO, with no signs of slowing." },
      { key: "SHOP", pct: 20, rationale: "Canada's global technology platform. Shopify powers 10% of US e-commerce and is expanding into payments and banking. The international growth story is still in the early chapters." },
      { key: "AEM", pct: 20, rationale: "Gold is insurance for a growth portfolio — and Agnico Eagle is the highest-quality miner on the planet. All operations in tier-1 jurisdictions. With gold at record highs, Agnico is at peak profitability." },
      { key: "WCN", pct: 15, rationale: "The compounder that never makes headlines. Waste Connections has quietly beaten the S&P 500 for 15 years straight by acquiring small regional waste operators at attractive prices." },
    ],
  ],
};

function tierIndex(amount: InvestAmount): number {
  if (amount === "under1k") return 0;
  if (amount === "1to5k") return 1;
  return 2;
}

// ---- Engine ----

export function computeBlueprint(inputs: BlueprintInputs): Blueprint {
  const { birthYear, goal, income, investAmount, monthlySavings, style } = inputs;
  const age = 2026 - birthYear;
  const lumpSum = LUMP_MAP[investAmount];
  const monthly = MONTHLY_MAP[monthlySavings];
  const tfsaRoom = calcTFSARoom(birthYear);
  const fhsaEligible = age >= 18 && age <= 40 && goal === "home";
  const tier = tierIndex(investAmount);

  // Holdings
  const allocations = PORTFOLIOS[style][tier];
  const holdings: PortfolioHolding[] = allocations.map((a) => ({
    ...STOCKS[a.key],
    allocationPct: a.pct,
    allocationAmt: Math.round((a.pct / 100) * lumpSum),
    rationale: a.rationale,
  }));

  // Conservative estimated forward annual returns
  // (not raw historical avg, which was skewed by pandemic recovery)
  const annualRate = style === "income" ? 7.5 : style === "balanced" ? 9.2 : 11.8;

  // Growth projection
  const projection: GrowthProjection = {
    lumpSum, monthly, annualRate,
    yr10: fvCalc(lumpSum, monthly, annualRate, 10),
    yr20: fvCalc(lumpSum, monthly, annualRate, 20),
    yr30: fvCalc(lumpSum, monthly, annualRate, 30),
  };

  // Account plan
  let accountPlan: AccountPlan;
  if (fhsaEligible) {
    accountPlan = {
      primary: "FHSA", secondary: "TFSA", tfsaRoom, fhsaEligible,
      reasoning: "You qualify for the First Home Savings Account — the most powerful account the CRA has ever created. Contributions are tax-deductible like an RRSP, and your first-home withdrawal is completely tax-free like a TFSA. Max it first ($8,000/year, up to $40,000 lifetime), then put the rest in your TFSA.",
    };
  } else if (income === "under50" || income === "50to80") {
    accountPlan = {
      primary: "TFSA", tfsaRoom, fhsaEligible,
      reasoning: `At your income level, the TFSA is your most powerful tool. RRSP deductions are most valuable when you're in a higher bracket — once you cross $80K, that math shifts. For now, every dollar in your TFSA grows completely tax-free, and you can withdraw at any time without penalty. You have $${tfsaRoom.toLocaleString("en-CA")} in unused room to deploy.`,
    };
  } else if (income === "80to120") {
    accountPlan = {
      primary: "TFSA", secondary: "RRSP", tfsaRoom, fhsaEligible,
      reasoning: "At $80–120K, both accounts work hard for you. Max your TFSA first for flexibility and fully tax-free growth. Once your TFSA is maxed for the year, direct contributions to your RRSP — the deduction saves you 33–43% in taxes depending on your province.",
    };
  } else {
    accountPlan = {
      primary: "RRSP", secondary: "TFSA", tfsaRoom, fhsaEligible,
      reasoning: "At $120K+, your RRSP is a tax-minimization machine first, an investment account second. Every $1,000 contributed saves you roughly $430–$530 in current taxes (depending on province). Max your RRSP first, then overflow into your TFSA. Together, they shelter the majority of your lifetime investment growth from the CRA.",
    };
  }

  // Broker recommendation
  let broker: Blueprint["broker"];
  let brokerReason: string;
  if (investAmount === "under1k" || investAmount === "1to5k" || age < 28) {
    broker = "wealthsimple";
    brokerReason = "Wealthsimple is built for exactly where you're starting. Zero commissions on Canadian stocks, instant TFSA setup in minutes, and a clean app that doesn't overwhelm you. No account minimums required.";
  } else if (income === "over120" && (investAmount === "over100k" || investAmount === "25to100k")) {
    broker = "both";
    brokerReason = "Use Wealthsimple for Canadian equities (commission-free on TSX stocks) and Questrade for US stocks (better USD conversion rates). At this portfolio size, the difference in currency fees becomes meaningful over time.";
  } else {
    broker = "wealthsimple";
    brokerReason = "Wealthsimple handles everything this portfolio needs — commission-free trades on TSX stocks, fractional shares, and built-in TFSA, RRSP, and FHSA accounts all in one place. A strong choice for Canadian DIY investors at any level.";
  }

  // Profile label
  const styleLabel = style === "income" ? "Income" : style === "balanced" ? "Balanced Growth" : "High-Growth";
  const goalLabel = goal === "home" ? "Home Buyer" : goal === "retire" ? "Early Retirement" : goal === "wealth" ? "Wealth Builder" : "First-Time Investor";

  // Playbook cross-link
  const playbookSlug = style === "income" ? "canadian-dividend-investing-guide" : "tfsa-asset-location-guide";
  const playbookTitle = style === "income" ? "Canadian Dividend Investing Guide" : "TFSA Asset Location Guide";

  const smallAmountNote =
    investAmount === "under1k"
      ? "With under $1,000 to start, keeping it simple is the right move — two positions is plenty. As you save past $5,000 you can expand your portfolio one conviction pick at a time."
      : investAmount === "1to5k"
      ? "A focused 3-position portfolio is ideal at this stage. As you grow past $10,000, consider adding one or two more picks to round it out."
      : undefined;

  return {
    profileLabel: `${styleLabel} ${goalLabel}`,
    age, broker, brokerReason,
    accountPlan, holdings, projection,
    playbookSlug, playbookTitle, smallAmountNote,
  };
}
