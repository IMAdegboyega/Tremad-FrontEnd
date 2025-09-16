import React, { ReactNode } from 'react';

type SuperAdminProps = {
  children: ReactNode;
};

export default function SuperAdmin({ children }: SuperAdminProps) {
  return (
    <main>
      <div>
        <section>{children}</section>
      </div>
    </main>
  );
}
