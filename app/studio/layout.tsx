import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlphaBeat Studio",
  description: "Content management studio for AlphaBeat",
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {children}
    </div>
  );
}
