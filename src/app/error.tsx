"use client";

import { Button, LinkButton } from "@/components/ui/Button";

/** Route-level error boundary. Never shows stack traces or internal messages to visitors. */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="text-ink-soft mt-3">
        This page hit an unexpected problem. Your input was not sent anywhere. Try again,
        or head back to the homepage.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <LinkButton href="/" variant="secondary">
          Go to homepage
        </LinkButton>
      </div>
    </div>
  );
}
