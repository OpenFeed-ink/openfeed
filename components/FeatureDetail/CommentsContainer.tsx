"use client";

import { useEffect, useRef } from "react";

export function CommentsContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // expose scroll function globally (simple trick)
    (globalThis as any).__scrollCommentsToTop = () => {
      ref.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    return () => {
      delete (globalThis as any).__scrollCommentsToTop;
    };
  }, []);

  return (
    <div ref={ref} className="max-h-112.5 overflow-y-auto">
      {children}
    </div>
  );
}
