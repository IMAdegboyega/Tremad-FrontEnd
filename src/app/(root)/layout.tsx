'use client'

import ProfileCard from '@/Components/ProfileCard';
import SearchBar from '@/Components/SearchBar';
import SideBar from '@/Components/SideBar';
import { StudentNav } from '@/Constants';
import { Bell } from 'lucide-react';
import React, { ReactNode } from 'react';
import { UserProvider } from '@/Constants/UserContext';

type HomeProps = {
  children: ReactNode;
};

export default function Home({ children }: HomeProps) {
  return (
    <UserProvider>
      <main className="h-screen">
        <div className="flex bg-white p-6 space-x-4 text-black h-full">
          {/* Sidebar */}
          <SideBar navItems={StudentNav} />

          {/* Main Content */}
          <div className="flex-1 flex flex-col space-y-3">
            {/* ✅ Persistent Header */}
            <header className="flex items-center justify-between p-4 bg-gray-50 sticky top-0 z-10 rounded-2xl h-20">
              <SearchBar />
              <div className='flex items-center gap-6'>
                <div className='bg-white p-2 rounded-full cursor-pointer'>
                  <Bell />
                </div>

                <ProfileCard />
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
