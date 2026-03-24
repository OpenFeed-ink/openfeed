"use client";

import { useRef } from "react";

export function CommentsContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // expose scroll function globally (simple trick)
  (globalThis as any).__scrollCommentsToTop = () => {
    ref.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div ref={ref} className="max-h-112.5 overflow-y-auto">
      {children}
    </div>
  );
}
