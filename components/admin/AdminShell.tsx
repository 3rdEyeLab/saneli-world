'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { label: 'DASHBOARD', href: '/admin/dashboard' },
  { label: 'PRODUCTS',  href: '/admin/products' },
  { label: 'ORDERS',    href: '/admin/orders' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-black border-r border-white/5 flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/5">
          <img src="/mainpagelogo.png" alt="SANELi" className="h-8 w-auto object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <p className="font-heading text-[10px] tracking-[0.4em] text-white/30 uppercase mt-1">Admin</p>
        </div>

        <nav className="flex-1 py-6 px-3 flex flex-col gap-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-heading text-xs tracking-[0.25em] px-3 py-2.5 transition-colors ${
                pathname.startsWith(item.href)
                  ? 'text-gold bg-gold/10'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full font-heading text-xs tracking-[0.25em] px-3 py-2.5 text-white/30 hover:text-white hover:bg-white/5 transition-colors text-left"
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
