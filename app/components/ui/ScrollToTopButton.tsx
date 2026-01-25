// app/components/ui/ScrollToTopButton.tsx
"use client";

import { useEffect, useState } from "react";

export default function ScrollToTopButton({
  showAfter = 400,
}: {
  showAfter?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={[
        "fixed bottom-6 right-6 z-50",
        "h-12 w-12 rounded-full",
        "flex items-center justify-center",
        "bg-white/10 backdrop-blur border border-white/10",
        "text-white shadow-lg",
        "transition-all duration-200",
        "hover:bg-white/15 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-white/30",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
      >
        <path
          d="M12 5l-7 7m7-7l7 7M12 5v14"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
