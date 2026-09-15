// src/app/staff/(auth)/sign-in/page.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { teacherLogin, storePasswordChangeHandoff } from '@/lib/api';
import TremadLoader, { useDeferredLoading } from '@/components/shared/TremadLoader';

export default function AdminSignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Set the moment we start navigating away. `router.push` resolves long
  // before the next route paints, so clearing `loading` in `finally` drops
  // the loader and repaints THIS page for a second or two first. The ref (not
  // state) is deliberate: it must be readable inside the same tick.
  const navigatingRef = useRef(false);
  const [formData, setFormData] = useState({
    teacherId: '',
    password: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result: any = await teacherLogin(formData.teacherId, formData.password);

      if (result.success) {
        // First-login: backend returns requiresPasswordChange + userId and does
        // NOT issue a session yet. Mirror the student flow → reset-password.
        if (result.requiresPasswordChange || result.data?.requiresPasswordChange) {
          // The change token is what authorises the reset — the userId alone
          // is not enough (and must not be).
          storePasswordChangeHandoff(
            result.userId || result.data?.userId,
            result.changeToken || result.data?.changeToken
          );
          navigatingRef.current = true;
          router.push('/staff/reset-password');
          return;
        }
        navigatingRef.current = true;
        router.push('/staff/home');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
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
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Staff Portal</h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Email or Staff ID
          </label>
          <input
            type="text"
            value={formData.teacherId}
            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            placeholder="Enter your email or staff ID"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
