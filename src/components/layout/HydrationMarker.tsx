"use client";

import { useEffect } from "react";

/**
 * Sets data-hydrated on <html> once React has taken over the page. Used by end-to-end
 * tests so they never type into a form before it is interactive. It has no visual effect.
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return null;
}
