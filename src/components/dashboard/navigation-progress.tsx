"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const widthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // When pathname changes, the navigation is complete — hide bar
    setWidth(100);
    const hide = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 300);
    return () => clearTimeout(hide);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http")) return;

      // Start progress bar
      setWidth(15);
      setVisible(true);

      // Slowly advance to 80% while waiting
      timerRef.current = setTimeout(() => setWidth(40), 100);
      widthTimerRef.current = setTimeout(() => setWidth(70), 400);
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (widthTimerRef.current) clearTimeout(widthTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[200] h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)] transition-all duration-300 ease-out"
      style={{ width: `${width}%` }}
    />
  );
}
