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
 * MOBILE: the link list used to be `hidden md:flex` with nothing behind it,
 * so below 768px the nav was a logo and a Login button and NOTHING else —
 * every section link, including Contact Us, simply did not exist on a phone.
 * The hamburger below is that missing half.
 */

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

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
  const [menuOpen, setMenuOpen] = useState(false);

  // Don't let the page scroll behind an open full-height menu.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Close first, then scroll on the next frame. Scrolling while the menu
    // still has `overflow: hidden` on <body> lands in the wrong place.
    setMenuOpen(false);
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update the fragment so it's shareable, without triggering the
      // router's own scroll (replaceState skips it).
      history.replaceState(null, '', `#${id}`);
    });
  };

  /** Logo click → smooth scroll all the way back to the top of the page. */
  const scrollToTop = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', window.location.pathname);
  };

  return (
    <nav className="bg-primary-green sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="flex items-center cursor-pointer bg-transparent border-0 p-0"
          >
            <Image
              src="/icon/logo.svg"
              alt="Tremad Schools"
              width={50}
              height={50}
            />
          </button>

          {/* Desktop links */}
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

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="text-primary-green font-semibold bg-white rounded-md px-4 sm:px-6 py-2 text-sm sm:text-base hover:shadow-xl hover:-translate-y-1 transition"
            >
              Login
            </Link>

            {/* Hamburger — the piece that was missing entirely */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="md:hidden text-white p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/15 bg-primary-green">
          <ul className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(link.id)}
                  className="w-full text-left text-white py-3.5 px-1 border-b border-white/10 last:border-0 hover:text-green-200 transition"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
