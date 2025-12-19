'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignIn } from '@clerk/nextjs';
import Logo from '@/components/Logo';
import { Card } from '@/components/ui/card';

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="p-8 border-white/10 bg-black/40 backdrop-blur-xl">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-muted-foreground">Access your master node dashboard</p>
          </div>

          {/* Clerk Sign In Component */}
          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-none p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20 border-none",
                  formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500",
                  formFieldLabel: "text-gray-300",
                  footerActionLink: "text-indigo-400 hover:text-indigo-300",
                  identityPreviewText: "text-gray-300",
                  formFieldAction: "text-indigo-400 hover:text-indigo-300",
                  dividerLine: "bg-white/10",
                  dividerText: "text-gray-500",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                  socialButtonsBlockButtonText: "text-white",
                  formResendCodeLink: "text-indigo-400 hover:text-indigo-300",
                  otpCodeFieldInput: "bg-white/5 border-white/10 text-white focus:border-indigo-500 focus:ring-indigo-500"
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  showOptionalFields: false,
                }
              }}
              routing="hash"
              signUpUrl="/sign-up"
              afterSignInUrl="/dashboard"
              redirectUrl="/dashboard"
            />
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Secure Master Node Portal • AuramX Investment Platform
        </p>
      </div>
    </div>
  );
}
