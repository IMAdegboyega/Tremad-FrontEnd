// app/coming-soon/page.tsx
'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ComingSoonPage() {
  const router = useRouter()
  const [showDevAccess, setShowDevAccess] = useState(false)
  
  // For development - show access button
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const handleAccessSite = () => {
    // Navigate to home with bypass parameter
    router.push('/home?bypass=true')
  }
  
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-800 to-lime-400">
      <div className="flex flex-col text-center text-black p-8">
        <div className="mb-8">
          {/* Your logo here if you have one */}
          <div className="flex items-center space-x-4 justify-center">
            <Image
              src={'/icon/logo.svg'}
              alt='TREMAD Logo'
              width={100}
              height={100}
              className="object-contain"
            />
            <h1 className="text-5xl font-bold mb-4">TREMAD SCHOOLS</h1>
          </div>
        </div>
        <h1 className="text-3xl mb-6">WE WILL BE RIGHT BACK!</h1>
      </div>
    </main>
  );
}