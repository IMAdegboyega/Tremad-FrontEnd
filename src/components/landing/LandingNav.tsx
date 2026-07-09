'use client';

/**
 * LandingNav — the sticky top nav for the landing page.
 *
 * Why this is a client component instead of a `<Link href="#anchor">` list:
 * Next.js App Router intercepts hash-only links via its router; the CSS
 * `scroll-behavior: smooth` on <html> often doesn't animate because the
 * navigation is routed through the router's scroll implementation rather
 * than the browser's default hash-scroll behavior. Handling the click
 * manually with `scrollIntoView({ behavior: 'smooth' })` sidesteps that
 * quirk and gives us a reliable animated scroll every time.
 *
 * Visual styling is unchanged from the original inline nav — same sticky
 * green bar, same logo, same link list, same Login pill on the right.
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface NavLink {
  id: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'facilities', label: 'Our Facilities' },
  { id: 'program', label: 'Our Programs' },
  { id: 'about', label: 'About Us' },
  { id: 'apply', label: 'Apply' },
  { id: 'contact', label: 'Contact Us' },
];

export default function LandingNav() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Also update the URL fragment so it's shareable / bookmarkable, without
    // triggering the router's own scroll (history.replaceState skips it).
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav className="bg-primary-green sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Image
              src="/icon/logo.svg"
              alt="Tremad Schools"
              width={50}
              height={50}
            />
          </div>
          <ul className="hidden md:flex space-x-8 text-white">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(link.id)}
                  className="hover:text-green-200 transition cursor-pointer bg-transparent border-0 p-0 font-inherit text-inherit"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/sign-in"
            className="text-primary-green font-semibold bg-white rounded-md px-6 py-2 hover:shadow-xl hover:-translate-y-1"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
