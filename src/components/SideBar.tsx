'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'
import LogoutButton from './LogoutButton';
import NeedHelpDialog from './shared/NeedHelpDialog';

type NavItem = {
  name: string;
  slug: string;
  icon: string;
  url: string;
};

type SidebarProps = {
  navItems: readonly NavItem[];
  /**
   * Whether to render the "Need Help?" promo card above the logout button.
   * Enabled for the student and admin shells; omitted for SuperAdmin.
   */
  showHelpCard?: boolean;
};

export default function SideBar({ navItems, showHelpCard = false }: SidebarProps) {
  // The "Contact us" button below had no onClick at all — it rendered and did
  // nothing. This is the state it was missing.
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <aside className=' bg-gray-50 rounded-2xl p-4 space-y-5 max-h-fit w-70 sticky'>
      <nav className='flex flex-col gap-1'>
        <div className='flex items-center gap-2 mb-5 p-2'>
          <Image
            src={'/icon/logo.svg'}
            alt='Tremad logo'
            width={50}
            height={50}
          />
          <h2 className='font-medium'>TREMAD SCHOOLS</h2>
        </div>

        {navItems.map((item) => (
          <Link
            key={item.slug}
            href={item.url}
            className="flex items-center gap-2 p-2 space-x-2 space-y-2 pt-4 pb-4"
          >
            <Image src={item.icon} alt={item.name} width={24} height={24} />

            <span className='text-gray-700'>{item.name}</span>
          </Link>
        ))}

        {/* "Need Help?" promo card — sits between the nav list and logout with a
            generous gap so it reads as a distinct block. Student/staff only. */}
        {showHelpCard && (
          <div className='mt-10 rounded-2xl bg-primary-green-hover p-4 text-white'>
            <h3 className='text-lg font-semibold'>Need Help?</h3>
            <p className='mt-1 text-sm text-white/70'>
              We&apos;re here for you. Just reach out!
            </p>
            <button
              type='button'
              onClick={() => setHelpOpen(true)}
              className='mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-primary-green transition hover:bg-white/90 cursor-pointer'
            >
              Contact us
            </button>
          </div>
        )}

        <LogoutButton />
      </nav>

      <NeedHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </aside>
  )
}
