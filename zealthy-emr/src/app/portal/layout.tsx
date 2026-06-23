'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface User { id: number; name: string; email: string; }

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => setUser(data.user))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }
  if (!user) return null;

  const navItems = [
    { href: '/portal', label: 'Dashboard' },
    { href: '/portal/appointments', label: 'Appointments' },
    { href: '/portal/prescriptions', label: 'Prescriptions' },
  ];

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/portal" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="font-bold">Patient Portal</span>
              </Link>
              <div className="hidden sm:flex space-x-1">
                {navItems.map(item => (
                  <Link key={item.href} href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm hidden sm:block">{user.name}</span>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700 font-medium">Sign Out</button>
            </div>
          </div>
        </div>
        <div className="sm:hidden border-t border-gray-200 px-4 py-2 flex space-x-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex-1 text-center px-2 py-2 rounded-md text-xs font-medium ${pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}