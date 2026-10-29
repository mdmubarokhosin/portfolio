import Link from "next/link";

export const runtime = "edge";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center text-foreground">
      <p className="bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-7xl font-black text-transparent">
        404
      </p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This portfolio is a single-page app — pages live under hash routes like{" "}
          <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">/#/projects</code>.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Back to the portfolio
      </Link>
    </div>
  );
}
