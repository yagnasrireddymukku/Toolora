import { ADSENSE_CLIENT } from "@/lib/site";

/**
 * Reserved ad container for future AdSense. Renders nothing until
 * NEXT_PUBLIC_ADSENSE_CLIENT is configured, so no fake ads or empty gaps ship.
 * The AdSense script itself is not loaded until an approved slot ID is wired in here.
 */
export function AdSlot({ slot }: { slot?: string }) {
  if (!ADSENSE_CLIENT || !slot) return null;
  return (
    <aside
      aria-label="Advertisement"
      className="my-6 min-h-[100px]"
      data-ad-slot={slot}
    />
  );
}
