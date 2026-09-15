// src/app/admin/(auth)/sign-in/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { superAdminGoogleLogin } from '@/lib/api';
import TremadLoader, { useDeferredLoading } from '@/components/shared/TremadLoader';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function SuperAdminSignIn() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Set the moment we start navigating away. `router.push` resolves long
  // before the next route paints, so clearing `loading` in `finally` drops
  // the loader and repaints THIS page for a second or two first. The ref (not
  // state) is deliberate: it must be readable inside the same tick.
  const navigatingRef = useRef(false);
  const [googleReady, setGoogleReady] = useState(false);
  const router = useRouter();

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleResponse = useCallback(async (response: any) => {
    setError('');
    setLoading(true);

    try {
      const result = await superAdminGoogleLogin(response.credential);

      if (result.success && result.data) {
        navigatingRef.current = true;
        router.push('/admin/home');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      if (err.status === 403) {
        setError('This Google account is not authorized for admin access.');
      } else if (err.status === 401) {
        setError('Google authentication failed. Please try again.');
      } else if (err.isNetworkError) {
        setError('Unable to reach the server. Check your connection.');
      } else if (err.isTimeout) {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      // Stay up through the route change — see navigatingRef above.
      if (!navigatingRef.current) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Sign-In is not configured. Contact your administrator.');
      return;
    }

    // Load the Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'outline',
            size: 'large',
            width: 400,
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        }
        setGoogleReady(true);
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) existing.remove();
    };
  }, [GOOGLE_CLIENT_ID, handleGoogleResponse]);

  // Deferred so a fast response doesn't strobe the loader on and off, and
  // held for a minimum beat once shown. See useDeferredLoading.
  const showLoader = useDeferredLoading(loading);

  return (
    <div className="w-full">
      {/* Overlays the form rather than replacing it, so the translucent
          backdrop has something to show through — and the fields stay
          exactly where they were if the request fails. */}
      {showLoader && <TremadLoader message="Verifying your account" />}

      {/* School Logo */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center justify-center">
          <Image
            src="/icon/logo.svg"
            alt="School Logo"
            width={80}
            height={80}
          />
        </div>
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-semibold text-gray-900">Admin Portal</h2>
      </div>
      <p className="text-center text-gray-500 mb-10">
        Sign in with your authorized Google account
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Google Sign-In Button */}
      <div className="flex justify-center">
        <div id="google-signin-button" />
      </div>

      {/* Fallback if Google button hasn't loaded */}
      {!googleReady && !error && (
        <div className="flex justify-center">
          <div className="w-[400px] h-[44px] bg-gray-100 rounded-md animate-pulse" />
        </div>
      )}
    </div>
  );
}
