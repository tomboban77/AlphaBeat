import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-6 flex flex-wrap items-center gap-1 text-xs text-ash-500 ${className || ""}`}
    >
      <Link href="/" className="hover:text-ash-200">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-ink-500" />
          {item.href ? (
            <Link href={item.href} className="hover:text-ash-200">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-ash-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
