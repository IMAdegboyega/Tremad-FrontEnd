// src/app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle forgot password logic
    router.push('/check-email');
  };

  return (
    <div className="w-full">
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

      {/* Title */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-semibold text-gray-900">Forgot password?</h2>
      </div>
      <p className="text-center text-gray-600 mb-8">
        Please enter the email assigned to your account for password recovery.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jameswhite@gmail.com"
            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
        >
          Continue
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-800">
          Back to login
        </Link>
      </div>
    </div>
  );
}