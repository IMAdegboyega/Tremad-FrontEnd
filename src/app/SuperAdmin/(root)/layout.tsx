'use client'

import ProfileCard from '@/Components/ProfileCard';
import SearchBar from '@/Components/SearchBar';
import SideBar from '@/Components/SideBar';
import { SuperAdminNav } from '@/Constants';
import { Bell, Menu } from 'lucide-react';
import React, { ReactNode, useState } from 'react';
import { UserProvider } from '@/Constants/UserContext';
import Image from 'next/image';
import MobileSidebar from '@/Components/MobileSidebar';

type HomeProps = {
  children: ReactNode;
};

export default function Home({ children }: HomeProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  const sidebarNavItems = SuperAdminNav.filter(item => item.showInSidebar);

  return (
    <UserProvider>
      <main className="h-screen">
        <div className="flex bg-white p-6 space-x-4 text-black h-full">
          {/* Sidebar */}
          <div className='hidden md:block sticky'>
            <SideBar navItems={sidebarNavItems}/>
          </div>

          {/* Mobile Sidebar */}
          <MobileSidebar 
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            navItems={sidebarNavItems}
          />
          

          {/* Main Content */}
          <div className="flex-1 flex flex-col space-y-3">
            {/* ✅ Persistent Header */}
            <header className="hidden md:flex items-center justify-between p-4 bg-gray-50 sticky top-0 z-10 rounded-2xl h-20">
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

            {/* ✅ Mobile Header */}
            <header className="flex md:hidden items-center justify-between px-0 p-4 bg-white sticky top-0 z-10 rounded-2xl h-20">
              <div className='flex items-center gap-2 mb-5 p-2'>
                <Image
                  src={'/icon/logo.svg'}
                  alt='Tremad logo'
                  width={50}
                  height={50}
                />
                <h2 className='font-medium'>TREMAD SCHOOLS</h2>
              </div>

              {/* Right icons */}
              <div className="flex gap-4 items-center">
                <Bell 
                  className='cursor-pointer' 
                  onClick={() => window.location.href = '/notification'}
                />
                <Menu 
                  className='cursor-pointer'
                  onClick={() => setIsMobileSidebarOpen(true)}
                />
              </div>
            </header>

            {/* ✅ Section Content (scrollable, no extra height) */}
            <section className="flex-1 p-4 bg-gray-50 rounded-2xl overflow-y-auto">
              {children}
            </section>
          </div>
        </div>
      </main>
    </UserProvider>
  );
}
