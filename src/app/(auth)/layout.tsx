// src/app/(auth)/layout.tsx
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex p-6 bg-white">
      {/* Left side - School Building Image */}
      <div className="hidden lg:flex lg:w-1/2 relative rounded-2xl overflow-hidden mr-6">
        <Image
          src="/img/tremadschool.png" // You'll need to add your school building image
          alt="TREMAD School Building"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full">
          {children}
        </div>
      </div>
    </div>
  );
}