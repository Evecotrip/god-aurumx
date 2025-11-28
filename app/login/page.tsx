'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { SignIn } from '@clerk/nextjs';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Logo size="lg" />
          <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2">Master Node Login</h1>
          <p className="text-gray-600">Access your master node dashboard</p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-xl border border-gray-100 rounded-2xl"
              }
            }}
            routing="hash"
            signUpUrl="/sign-up"
            afterSignInUrl="/dashboard"
            redirectUrl="/dashboard"
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Secure Master Node Portal • AuramX Investment Platform
        </p>
      </div>
    </div>
  );
}
