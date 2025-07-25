"use client";

import Navigation from "@/components/Navigation";
import CreatorDashboard from "@/components/Dashboard/CreatorDashboard";
import { useRouter } from "next/navigation";

export default function CreatorDashboardPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    router.push(`/creator/${view}`);
  };

  return (
    <div className="min-h-screen">
      <Navigation
        currentView="dashboard"
        onNavigate={handleNavigate}
      />
      <div className="pt-0">
        <CreatorDashboard />
      </div>
    </div>
  );
} 