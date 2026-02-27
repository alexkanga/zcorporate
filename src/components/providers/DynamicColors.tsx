"use client";

import { useEffect, useLayoutEffect } from "react";

interface DynamicColorsProps {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

// Use useLayoutEffect to apply colors before paint (prevents flash)
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function DynamicColors({ color1, color2, color3, color4 }: DynamicColorsProps) {
  useIsomorphicLayoutEffect(() => {
    // Update CSS variables dynamically on the root element
    const root = document.documentElement;
    
    // Apply colors immediately
    root.style.setProperty("--color-primary", color1);
    root.style.setProperty("--color-secondary", color2);
    root.style.setProperty("--color-accent", color3);
    root.style.setProperty("--color-accent-light", color4);
    
    // Also set data attributes for potential CSS selectors
    root.dataset.colorPrimary = color1;
    root.dataset.colorSecondary = color2;
    root.dataset.colorAccent = color3;
    root.dataset.colorAccentLight = color4;
  }, [color1, color2, color3, color4]);

  return null;
}
