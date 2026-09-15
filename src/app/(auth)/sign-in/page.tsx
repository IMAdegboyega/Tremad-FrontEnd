// src/app/(auth)/sign-in/page.tsx
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { studentLogin, storePasswordChangeHandoff } from '@/lib/api';
import TremadLoader, { useDeferredLoading } from '@/components/shared/TremadLoader';

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    adminNumber: '',
    password: ''
  });
  const router = useRouter();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Set the moment we start navigating away. `router.push` resolves long
  // before the next route paints, so clearing `loading` in `finally` drops
  // the loader and repaints THIS page for a second or two first. The ref (not
  // state) is deliberate: it must be readable inside the same tick.
  const navigatingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result: any = await studentLogin(formData.adminNumber, formData.password);

      if (result.success) {
        if (result.requiresPasswordChange || result.data?.requiresPasswordChange) {
          // The change token is what authorises the reset — the userId alone
          // is not enough (and must not be).
          storePasswordChangeHandoff(
            result.userId || result.data?.userId,
            result.changeToken || result.data?.changeToken
          );
          navigatingRef.current = true;
          router.push('/reset-password');
        } else {
          navigatingRef.current = true;
          router.push('/home');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      if (err.message?.includes('Password change required')) {
        navigatingRef.current = true;
        router.push('/reset-password');
      } else {
        setError(err.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      // Stay up through the route change — see navigatingRef above.
      if (!navigatingRef.current) setLoading(false);
    }
  };

  // Deferred so a fast response doesn't strobe the loader on and off, and
  // held for a minimum beat once shown. See useDeferredLoading.
  const showLoader = useDeferredLoading(loading);

  return (
    <div className="w-full">
      {/* Overlays the form rather than replacing it, so the translucent
          backdrop has something to show through — and the fields stay
          exactly where they were if the request fails. */}
      {showLoader && <TremadLoader message="Signing you in" />}

      {/* Back to landing page — subtle top-left link so it doesn't compete
          with the main Login action but is easy to discover. */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-green transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>

      {/* School Logo */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center justify-center">
          <Image
            src={"/icon/logo.svg"}
            alt="School Logo"
            width={80}
            height={80}
          />
        </div>
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Welcome to your portal</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Admission number
          </label>
          <input
            type="text"
            value={formData.adminNumber}
            onChange={(e) => setFormData({ ...formData, adminNumber: e.target.value })}
            placeholder="Enter admission number"
            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <Link 
            href="/forgot-password" 
            className="text-sm text-green-600 hover:text-green-700"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}