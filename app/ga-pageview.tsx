"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GAPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId || typeof window === "undefined" || !("gtag" in window)) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    // @ts-ignore
    window.gtag("event", "page_view", { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

