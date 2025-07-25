"use client";

import Navigation from "@/components/Navigation";
import BrandSettings from "@/components/Brand/BrandSettings";
import { useRouter } from "next/navigation";

export default function BrandSettingsPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    router.push(`/brand/${view}`);
  };

  return (
    <div className="min-h-screen">
      <Navigation
        currentView="settings"
        onNavigate={handleNavigate}
      />
      <div className="pt-0">
        <BrandSettings />
      </div>
    </div>
  );
} 