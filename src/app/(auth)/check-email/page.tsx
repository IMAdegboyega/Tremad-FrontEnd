// src/app/(auth)/check-email/page.tsx
'use client';

import { Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckEmail() {
  return (
    <div className="w-full text-center">
      {/* Email Icon */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center justify-center">
          <Image
            src={"/icon/mailbox.svg"}
            alt='Mail Icon'
            width={80}
            height={80}
          />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Check your email</h2>
      <p className="text-gray-600 mb-8">
        Check your email for a reset link
      </p>

      <p className="text-sm text-gray-500 mb-8">
        Didn't receive an email? Resend code in <span className="font-semibold">0:20</span>
      </p>

      <Link 
        href="/sign-in" 
        className="inline-block px-8 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors"
      >
        Back to login
      </Link>
    </div>
  );
}