import NextLink from "next/link";
import type { ComponentProps } from "react";

// This Next.js/next-intl combination can return 404 for speculative RSC requests
// after a localized page scrolls. Keep client navigation, fetch only on activation.
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink {...props} prefetch={false} />;
}
