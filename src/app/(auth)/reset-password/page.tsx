// src/app/(auth)/reset-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import Image from 'next/image';

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const passwordRequirements = [
    { label: '8 characters', met: password.length >= 8 },
    { label: '1 symbol', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: '1 number', met: /\d/.test(password) }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === confirmPassword && passwordRequirements.every(req => req.met)) {
      router.push('/reset-success');
    }
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
        <h2 className="text-2xl font-semibold text-gray-900">Reset your password</h2>
      </div>
      <p className="text-center text-gray-600 mb-8">
        Your new password must have at least 8 characters, 1 symbol, and 1 number.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Type new password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
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

        {/* Password Requirements */}
        <div className="flex gap-4 text-sm">
          {passwordRequirements.map((req, index) => (
            <div key={index} className="flex items-center gap-1">
              {req.met ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              )}
              <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                {req.label}
              </span>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
        >
          Create password
        </button>
      </form>
    </div>
  );
}