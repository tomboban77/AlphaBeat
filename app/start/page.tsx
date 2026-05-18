import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/lib/utils";
import BlueprintFlow from "./BlueprintFlow";

export const metadata: Metadata = {
  title: `Your Canadian Investing Blueprint | ${SITE_NAME}`,
  description:
    "Answer 6 questions. Get a personalized investing plan built for your income, goal, and timeline — with exact dollar amounts, the right Canadian accounts, and real TSX stocks scored by AlphaBeat.",
  alternates: { canonical: absoluteUrl("/start") },
  openGraph: {
    title: `Build Your Canadian Investing Blueprint | ${SITE_NAME}`,
    description:
      "A personalized step-by-step investing plan for Canadian DIY investors. TFSA, RRSP, or FHSA — we tell you which account to open first, what to buy, and what it grows to in 30 years.",
    type: "website",
  },
};

export default function StartPage() {
  return <BlueprintFlow />;
}
