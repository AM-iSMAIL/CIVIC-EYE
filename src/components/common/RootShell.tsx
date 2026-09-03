'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * RootShell — renders the global Navbar and Footer only when the current
 * route is NOT inside the /admin section.  Admin pages supply their own
 * navigation chrome via AdminLayout / AdminSidebar.
 */
export const RootShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className="flex-1 flex flex-col">{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
};
