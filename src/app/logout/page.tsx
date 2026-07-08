// src/app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { removeToken, getUser } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api/endpoints';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function performLogout() {
      // Determine which zone the user was in for proper redirect
      const user = getUser();
      const role = user?.role;

      // Try to call the backend logout endpoint to invalidate the session
      try {
        const token = localStorage.getItem('tremad_auth_token');
        if (token) {
          let logoutUrl = `${API_BASE_URL}/auth/super-admin/logout`;
          if (role === 'student') {
            logoutUrl = `${API_BASE_URL}/student/auth/logout`;
          } else if (role === 'admin') {
            logoutUrl = `${API_BASE_URL}/admin/auth/teacher/logout`;
          }

          await fetch(logoutUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }).catch(() => {
            // Silent fail — we're logging out regardless
          });
        }
      } catch {
        // Silent fail — clearing local state is what matters
      }

      // Clear all auth state (token, user, cookies)
      removeToken();

      // Redirect to appropriate sign-in page
      if (role === 'super_admin') {
        router.replace('/SuperAdmin/sign-in');
      } else if (role === 'admin') {
        router.replace('/Admin/sign-in');
      } else {
        router.replace('/sign-in');
      }
    }

    performLogout();
  }, [router]);

  // Brief loading state while logout processes
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Signing out...</p>
      </div>
    </div>
  );
}
