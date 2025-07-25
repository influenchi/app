"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import SignupForm from "@/components/Auth/SignupForm";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userType = searchParams.get('type') as 'brand' | 'creator' | null;

  if (!userType) {
    router.push('/');
    return null;
  }

  const handleSignupComplete = (userType: 'brand' | 'creator') => {
    if (userType === 'brand') {
      router.push('/brand/onboarding');
    } else {
      router.push('/creator/onboarding');
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleLoginClick = () => {
    router.push(`/login?type=${userType}`);
  };

  return (
    <SignupForm
      userType={userType}
      onBack={handleBack}
      onSignupComplete={handleSignupComplete}
      onLoginClick={handleLoginClick}
    />
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
} 