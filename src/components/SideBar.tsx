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
};

export default function SideBar({ navItems }: SidebarProps) {
  
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

        <LogoutButton />
      </nav>
    </aside>
  )
}
