"use client";

import { useEffect, useRef } from "react";

interface AdInArticleProps {
  slot?: string;
}

export default function AdInArticle({ slot = "" }: AdInArticleProps) {
  const pushed = useRef(false);
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "";

  useEffect(() => {
    if (!publisherId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded
    }
  }, [publisherId]);

  // Parent only mounts this when publisherId is set — keep hooks unconditional here.

  return (
    <div className="my-8 flex min-h-[250px] items-center justify-center overflow-hidden rounded-lg bg-gray-50">
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={publisherId}
        data-ad-slot={slot}
      />
    </div>
  );
}
