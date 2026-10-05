import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Site-wide link. Prefetching is off because the static export is served by plain
 * file hosting (Hostinger/Apache), where Next's segment-prefetch URLs are not served
 * and would log 404s. Navigation still works: the browser loads the target HTML page.
 */
export default function SiteLink(props: ComponentProps<typeof Link>) {
  return <Link prefetch={false} {...props} />;
}
