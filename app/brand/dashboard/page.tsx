"use client";

import Navigation from "@/components/Navigation";
import BrandDashboard from "@/components/Brand/BrandDashboard";
import { useRouter } from "next/navigation";

export default function BrandDashboardPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    router.push(`/brand/${view}`);
  };

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