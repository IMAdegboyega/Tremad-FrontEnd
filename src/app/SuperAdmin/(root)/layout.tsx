'use client'

import ProfileCard from '@/components/ProfileCard';
import SearchBar from '@/components/SearchBar';
import SideBar from '@/components/SideBar';
import { SuperAdminNav } from '@/Constants';
import { Bell, Menu } from 'lucide-react';
import React, { ReactNode, useState } from 'react';
import { UserProvider } from '@/Constants/UserContext';
import Image from 'next/image';
import MobileSidebar from '@/components/MobileSidebar';

type HomeProps = {
  children: ReactNode;
};

/**
 * Fixed application shell.
 *
 * Layout invariants (these are what fix the "whole page scrolls" bug):
 *  - <main> is exactly 100vh AND `overflow-hidden`, so nothing can push the
 *    document taller and trigger a window-level scrollbar.
 *  - The row wrapper is `h-full overflow-hidden`, capping the height that
 *    the sidebar + main column can claim.
 *  - The sidebar column is `h-full overflow-y-auto` — if the nav ever gets
 *    taller than the viewport, it scrolls internally instead of resizing
 *    the shell.
 *  - The right-hand column is a flex-col with the header pinned (no shrink)
 *    and the section as `flex-1 min-h-0 overflow-y-auto`. The `min-h-0` is
 *    the critical bit: flex children default to `min-height: auto`, which
 *    means they'll grow to fit their content and defeat `overflow-y-auto`.
 *    Setting `min-h-0` lets the section actually shrink to the leftover
 *    space and scroll its content internally.
 *  - Scrollbars are hidden by `.no-scrollbar` here and by the global
 *    `::-webkit-scrollbar { display: none }` rule in globals.css.
 *
 * Net effect: sidebar stays put, header stays put, only the section content
 * scrolls, and there is no visible scrollbar anywhere.
 */
export default function Home({ children }: HomeProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const sidebarNavItems = SuperAdminNav.filter(item => item.showInSidebar);

  return (
    <UserProvider>
      <main className="h-screen overflow-hidden bg-white text-black">
        <div className="flex h-full overflow-hidden p-2 sm:p-4 md:p-6 md:space-x-4">
          {/* Sidebar — desktop only. Scrolls internally if its content is taller
              than the viewport so it never pushes the shell taller. */}
          <aside className="hidden md:block flex-shrink-0 h-full overflow-y-auto no-scrollbar">
            <SideBar navItems={sidebarNavItems}/>
          </aside>

          {/* Mobile drawer */}
          <MobileSidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            navItems={sidebarNavItems}
          />

          {/* Main content column */}
          <div className="flex-1 flex flex-col space-y-2 sm:space-y-3 min-w-0 h-full">
            {/* Desktop header — flex-shrink-0 so it never gives up space to a
                content explosion in the section below. */}
            <header className="hidden md:flex items-center justify-between p-4 bg-gray-50 z-10 rounded-2xl h-20 flex-shrink-0">
              <SearchBar />
              <div className='flex items-center gap-6'>
                <div className='bg-white p-2 rounded-full cursor-pointer'>
                  <Bell
                    className='cursor-pointer'
                    onClick={() => window.location.href = '/SuperAdmin/notification'}
                  />
                </div>
                <ProfileCard />
              </div>
            </header>

            {/* Mobile header */}
            <header className="flex md:hidden items-center justify-between px-1 py-2 bg-white z-10 flex-shrink-0">
              <div className='flex items-center gap-2'>
                <Image
                  src={'/icon/logo.svg'}
                  alt='Tremad logo'
                  width={36}
                  height={36}
                />
                <h2 className='font-medium text-sm sm:text-base'>TREMAD SCHOOLS</h2>
              </div>

              <div className="flex items-center">
                <button
                  className='p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center'
                  onClick={() => window.location.href = '/SuperAdmin/notification'}
                >
                  <Bell className='w-5 h-5' />
                </button>
                <button
                  className='p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center'
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className='w-5 h-5' />
                </button>
              </div>
            </header>

            {/* THE scrollable region. `flex-1 min-h-0` lets it shrink to the
                leftover height and `overflow-y-auto` makes its content scroll
                inside, leaving sidebar + header untouched. */}
            <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-2 sm:p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl">
              {children}
            </section>
          </div>
        </div>
      </main>
    </UserProvider>
  );
}
