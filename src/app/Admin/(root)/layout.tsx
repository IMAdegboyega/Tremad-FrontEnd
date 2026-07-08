'use client'

import ProfileCard from '@/components/ProfileCard';
import SearchBar from '@/components/SearchBar';
import SideBar from '@/components/SideBar';
import { AdminNav } from '@/Constants';
import { Bell, Menu } from 'lucide-react';
import React, { ReactNode, useState } from 'react';
import { UserProvider } from '@/Constants/UserContext';
import Image from 'next/image';
import MobileSidebar from '@/components/MobileSidebar';

type AdminLayoutProps = {
  children: ReactNode;
};

/**
 * Staff (Admin) application shell — same fixed layout as the SuperAdmin/student
 * shells, fed the trimmed AdminNav. See the SuperAdmin layout for the scroll
 * invariants that keep only the section content scrolling.
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const sidebarNavItems = AdminNav.filter((item) => item.showInSidebar);

  return (
    <UserProvider>
      <main className="h-screen overflow-hidden bg-white text-black">
        <div className="flex h-full overflow-hidden p-2 sm:p-4 md:p-6 md:space-x-4">
          {/* Sidebar — desktop only */}
          <aside className="hidden md:block flex-shrink-0 h-full overflow-y-auto no-scrollbar">
            <SideBar navItems={sidebarNavItems} />
          </aside>

          {/* Mobile drawer */}
          <MobileSidebar
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            navItems={sidebarNavItems}
          />

          {/* Main content column */}
          <div className="flex-1 flex flex-col space-y-2 sm:space-y-3 min-w-0 h-full">
            {/* Desktop header */}
            <header className="hidden md:flex items-center justify-between p-4 bg-gray-50 z-10 rounded-2xl h-20 flex-shrink-0">
              <SearchBar />
              <div className="flex items-center gap-6">
                <div className="bg-white p-2 rounded-full cursor-pointer">
                  <Bell
                    className="cursor-pointer"
                    onClick={() => (window.location.href = '/Admin/notification')}
                  />
                </div>
                <ProfileCard />
              </div>
            </header>

            {/* Mobile header */}
            <header className="flex md:hidden items-center justify-between px-1 py-2 bg-white z-10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Image src={'/icon/logo.svg'} alt="Tremad logo" width={36} height={36} />
                <h2 className="font-medium text-sm sm:text-base">TREMAD SCHOOLS</h2>
              </div>

              <div className="flex items-center">
                <button
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={() => (window.location.href = '/Admin/notification')}
                >
                  <Bell className="w-5 h-5" />
                </button>
                <button
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Scrollable section */}
            <section className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-2 sm:p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl">
              {children}
            </section>
          </div>
        </div>
      </main>
    </UserProvider>
  );
}
