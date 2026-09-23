'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react'
import LogoutButton from './LogoutButton';
import NeedHelpDialog from './shared/NeedHelpDialog';
import { useUser } from '@/Constants/UserContext';

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

  // Students in JSS 1 – SS 3 see TREMAD COLLEGE; anyone below sees TREMAD
  // SCHOOL. Staff and super-admins have no division at all (see UserContext),
  // so they fall through to the neutral brand — which means the admin and
  // staff shells cannot change here by accident, only by someone deliberately
  // giving those roles a division.
  //
  // All three shells render this inside <UserProvider>, and useUser() returns
  // null rather than throwing when there isn't one, so this is safe wherever
  // the sidebar ends up.
  const user = useUser();
  const brand = user?.divisionLabel ?? 'TREMAD SCHOOLS';

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
          <h2 className='font-medium'>{brand}</h2>
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
