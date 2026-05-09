import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { shouldOpenLinkInNewTab, slugify, cn } from "@/lib/utils";
import type { SanityBodyBlock, SanityImage } from "@/lib/types";

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const img = value as unknown as SanityImage & { caption?: string };
      if (!img.asset?._ref) return null;
      return (
        <figure className="my-8">
          <Image
            src={urlFor({ asset: { _ref: img.asset._ref } }).width(1200).url()}
            alt={img.alt || "Article image"}
            width={1200}
            height={654}
            sizes="(max-width: 768px) 100vw, min(720px, 100vw)"
            className="h-auto w-full max-w-full rounded-xl"
            style={{ width: "100%", height: "auto" }}
          />
          {img.caption && (
            <figcaption className="mt-2 text-center text-sm text-ash-400">
              {img.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({ children, value }) => {
      const mark = value as { href?: string; blank?: boolean };
      const openNewTab = shouldOpenLinkInNewTab(mark.href, mark.blank);
      return (
        <a
          href={mark.href}
          target={openNewTab ? "_blank" : undefined}
          rel={openNewTab ? "noopener noreferrer" : undefined}
          className="font-medium text-accent-300 underline decoration-accent-700 underline-offset-2 transition-colors hover:text-accent-200"
        >
          {children}
        </a>
      );
    },
  },
  block: {
    h2: ({ value, children }) => {
      const text =
        "children" in value && Array.isArray(value.children)
          ? (value.children as Array<{ text?: string }>)
              .map((c) => c.text ?? "")
              .join("")
          : "";
      const id = slugify(text);
      return (
        <h2
          id={id}
          className="mb-4 mt-10 scroll-mt-24 text-2xl font-bold tracking-tight text-ash-50"
        >
          {children}
        </h2>
      );
    },
    h3: ({ value, children }) => {
      const text =
        "children" in value && Array.isArray(value.children)
          ? (value.children as Array<{ text?: string }>)
              .map((c) => c.text ?? "")
              .join("")
          : "";
      const id = slugify(text);
      return (
        <h3 id={id} className="mb-3 mt-8 scroll-mt-24 text-xl font-semibold text-ash-50">
          {children}
        </h3>
      );
    },
    h4: ({ children }) => (
      <h4 className="mb-2 mt-6 text-lg font-semibold text-ash-50">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 rounded-r-lg border-l-4 border-accent-500 bg-ink-800/60 px-4 py-3 italic text-ash-200">
        {children}
      </blockquote>
    ),
  },
};

interface PortableProseProps {
  value: SanityBodyBlock[] | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function PortableProse({ value, size = "md", className }: PortableProseProps) {
  if (!value?.length) return null;
  const sizeCls =
    size === "lg"
      ? "prose-lg text-[18px] leading-[1.8]"
      : size === "sm"
      ? "prose-sm"
      : "prose-base";
  return (
    <div
      className={cn(
        "prose prose-ab max-w-none prose-headings:font-bold prose-a:no-underline",
        sizeCls,
        className
      )}
    >
      <PortableText value={value} components={components} />
    </div>
  );
}
