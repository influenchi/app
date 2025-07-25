"use client";

import { useRouter } from "next/navigation";
import BrandOnboarding from "@/components/Brand/BrandOnboarding";

export default function BrandOnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/brand/dashboard');
  };

  return <BrandOnboarding onComplete={handleComplete} />;
} 