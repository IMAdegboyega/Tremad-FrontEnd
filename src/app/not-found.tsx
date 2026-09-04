import Link from 'next/link';

/**
 * App Router 404.
 *
 * Beyond being nicer than the default, this file is load-bearing for the build:
 * without it Next falls back to the legacy Pages Router error components to
 * prerender /404, which fails with the misleading
 * "<Html> should not be imported outside of pages/_document".
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-md">
        <p className="text-6xl font-semibold text-primary-green">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-5 py-2.5 text-sm font-medium text-white bg-primary-green rounded-lg hover:bg-primary-green-hover transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
