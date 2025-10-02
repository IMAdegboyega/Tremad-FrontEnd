// src/app/(auth)/reset-success/page.tsx
'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetSuccess() {
  return (
    <div className="w-full text-center">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reset successful!</h2>
      <p className="text-gray-600 mb-8">
        Password reset successful!
      </p>

      <Link 
        href="/sign-in" 
        className="inline-block w-full px-8 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
      >
        Back to login
      </Link>
    </div>
  );
}