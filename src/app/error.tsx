"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the failure in the console for easier remote debugging
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center text-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
        ⚠️
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page hit an unexpected error. Your data is safe — reloading usually
          fixes it.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => window.location.assign("/")}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
