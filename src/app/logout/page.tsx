// src/app/logout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { removeToken, getUser } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api/endpoints';
import TremadLoader from '@/components/shared/TremadLoader';

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
        router.replace('/admin/sign-in');
      } else if (role === 'admin') {
        router.replace('/staff/sign-in');
      } else {
        router.replace('/sign-in');
      }
    }

    performLogout();
  }, [router]);

  // No deferred timing here: this route exists ONLY to show the wait, so
  // there is nothing to flash against — hiding it for the first 200ms would
  // just leave a blank white screen.
  return <TremadLoader message="Signing you out" />;
}
