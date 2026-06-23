// =============================================================
// FILE: src/app/admin/layout.tsx — Admin Navigation
// =============================================================
// This layout wraps ALL admin pages. It provides:
// - Green-themed navigation bar with "Zealthy EMR" branding
// - "← All Patients" back link when viewing a patient detail
//
// NO AUTH REQUIRED — per the exercise:
// "The EMR should reside at /admin and should not require authentication"
//
// 'use client' DIRECTIVE:
// This tells Next.js "this component runs in the BROWSER."
// We need it because usePathname() is a browser-only hook.
// =============================================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // usePathname() returns the current URL path (e.g., "/admin" or "/admin/patients/1")
  // We use this to decide whether to show the "← All Patients" link
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Navigation Bar ─────────────────────────────── */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900">Zealthy EMR</span>
              </Link>

              {/* Show back link only when NOT on the main admin page */}
              {pathname !== '/admin' && (
                <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                  &larr; All Patients
                </Link>
              )}
            </div>

            <div className="flex items-center">
              <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                Admin
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Page Content ───────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}