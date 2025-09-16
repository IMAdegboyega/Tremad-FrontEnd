import Sidebar from '@/Components/SideBar';
import { AdminNav } from '@/Constants';
import React, { ReactNode } from 'react';

type AdminProps = {
  children: ReactNode;
};

export default function Admin({ children }: AdminProps) {
  return (
    <main>
      <div>
        <Sidebar navItems={AdminNav}/>
        <section>{children}</section>
      </div>
    </main>
  );
}
