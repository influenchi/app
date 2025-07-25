"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import LoginForm from "@/components/Auth/LoginForm";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userType = searchParams.get('type') as 'brand' | 'creator' | null;

  const handleLoginComplete = (userType: 'brand' | 'creator') => {
    if (userType === 'brand') {
      router.push('/brand/dashboard');
    } else {
      router.push('/creator/dashboard');
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <LoginForm
      onBack={handleBack}
      onLoginComplete={handleLoginComplete}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
} 