"use client";

import Navigation from "@/components/Navigation";
import BrandDashboard from "@/components/Brand/BrandDashboard";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useAuth";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BrandDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleNavigate = (view: string) => {
    router.push(`/brand/${view}`);
  };

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-16 w-full" />
        <div className="p-8">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation
        currentView="dashboard"
        onNavigate={handleNavigate}
      />
      <div className="pt-0">
        <BrandDashboard />
      </div>
    </div>
  );
} 