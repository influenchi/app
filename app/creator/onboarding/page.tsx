"use client";

import { useRouter } from "next/navigation";
import CreatorOnboarding from "@/components/Creator/CreatorOnboarding";

export default function CreatorOnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/creator/dashboard');
  };

  return <CreatorOnboarding onComplete={handleComplete} />;
} 