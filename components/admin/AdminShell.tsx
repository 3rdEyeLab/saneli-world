'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { label: 'DASHBOARD',   href: '/admin/dashboard' },
  { label: 'PRODUCTS',    href: '/admin/products' },
  { label: 'ORDERS',      href: '/admin/orders' },
  { label: 'SUBSCRIBERS', href: '/admin/subscribers' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const NavContent = () => (
    <>
      <div className="px-6 py-5 border-b border-white/5">
        <img src="/mainpagelogo.png" alt="SANELi" className="h-8 w-auto object-contain"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <p className="font-heading text-[10px] tracking-[0.4em] text-white/30 uppercase mt-1">Admin</p>
      </div>
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
            className={`font-heading text-xs tracking-[0.25em] px-3 py-3 transition-colors ${
              pathname.startsWith(item.href)
                ? 'text-gold bg-gold/10'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/5">
        <button onClick={handleLogout}
          className="w-full font-heading text-xs tracking-[0.25em] px-3 py-3 text-white/30 hover:text-white hover:bg-white/5 transition-colors text-left">
          SIGN OUT
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-black border-r border-white/5 flex-col shrink-0">
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside className="absolute left-0 top-0 h-full w-64 bg-black border-r border-white/5 flex flex-col z-50"
            onClick={e => e.stopPropagation()}>
            <NavContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 w-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-black">
          <button onClick={() => setOpen(true)} className="text-white/60 hover:text-white p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <img src="/mainpagelogo.png" alt="SANELi" className="h-7 w-auto object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="w-8" />
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
