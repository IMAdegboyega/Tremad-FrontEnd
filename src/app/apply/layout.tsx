import type { Metadata } from 'next';

/**
 * Public shell for /apply.
 *
 * Kept outside the (root)/(auth)/admin/staff trees on purpose: those all mount
 * UserProvider and a sidebar, which assume a signed-in user. Everyone here is
 * a stranger.
 */
export const metadata: Metadata = {
  title: 'Apply for Admission | Tremad Schools',
  description:
    'Apply for admission to Tremad Schools, track your application, and view book lists, scheme of work and school fees.',
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#FBFCE9]">{children}</div>;
}
