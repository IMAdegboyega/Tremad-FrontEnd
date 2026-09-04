'use client';

/**
 * App Router global error boundary — the counterpart to not-found.tsx for
 * /_error. It replaces the root layout when it renders, so it must supply its
 * own <html> and <body>.
 *
 * (Note: these are ordinary lowercase JSX tags, NOT next/document's <Html>,
 * which is what the "should not be imported outside of pages/_document" build
 * error was complaining about.)
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold text-gray-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-600">
              An unexpected error occurred. Please try again.
            </p>
            {error?.digest && (
              <p className="mt-2 text-xs text-gray-400">Reference: {error.digest}</p>
            )}
            <button
              onClick={() => reset()}
              className="mt-6 inline-block px-5 py-2.5 text-sm font-medium text-white bg-primary-green rounded-lg hover:bg-primary-green-hover transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
