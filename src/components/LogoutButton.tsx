// src/components/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { removeToken, getUser } from '@/lib/api';
import { API_BASE_URL } from '@/lib/api/endpoints';
import Image from 'next/image';

interface LogoutButtonProps {
  className?: string;
  iconSize?: number;
}

export default function LogoutButton({ className, iconSize = 24 }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    // Get role before clearing storage
    const user = getUser();
    const role = user?.role;

    // Call backend logout to invalidate session (fire and forget)
    try {
      const token = localStorage.getItem('tremad_auth_token');
      if (token) {
        let logoutUrl = `${API_BASE_URL}/auth/super-admin/logout`;
        if (role === 'student') {
          logoutUrl = `${API_BASE_URL}/student/auth/logout`;
        } else if (role === 'admin') {
          logoutUrl = `${API_BASE_URL}/admin/auth/teacher/logout`;
        }

        fetch(logoutUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {});
      }
    } catch {
      // Silent fail
    }

    // Clear all auth state
    removeToken();

    // Redirect to appropriate sign-in
    if (role === 'super_admin') {
      router.replace('/SuperAdmin/sign-in');
    } else if (role === 'admin') {
      router.replace('/Admin/sign-in');
    } else {
      router.replace('/sign-in');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "flex items-center gap-2 p-2 space-x-2 space-y-2 pt-4 cursor-pointer"}
    >
      <Image src="/icon/logout.svg" alt="Logout" width={iconSize} height={iconSize} />
      <span className="text-gray-700">LogOut</span>
    </button>
  );
}
