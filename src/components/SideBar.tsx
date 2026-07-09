import Image from 'next/image';
import Link from 'next/link';
import React from 'react'
import LogoutButton from './LogoutButton';

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
            generous gap so it reads as a distinct block. Student/Admin only. */}
        {showHelpCard && (
          <div className='mt-10 rounded-2xl bg-primary-green-hover p-4 text-white'>
            <h3 className='text-lg font-semibold'>Need Help?</h3>
            <p className='mt-1 text-sm text-white/70'>
              We&apos;re here for you. Just reach out!
            </p>
            <button
              type='button'
              className='mt-4 w-full rounded-xl bg-primary-green py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90'
            >
              Contact us
            </button>
          </div>
        )}

        <LogoutButton />
      </nav>
    </aside>
  )
}
