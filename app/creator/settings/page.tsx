"use client";

import Navigation from "@/components/Navigation";
import CreatorSettings from "@/components/Creator/CreatorSettings";
import { useRouter } from "next/navigation";

export default function CreatorSettingsPage() {
  const router = useRouter();

  const handleNavigate = (view: string) => {
    router.push(`/creator/${view}`);
  };

  return (
    <div className="min-h-screen">
      <Navigation
        currentView="settings"
        onNavigate={handleNavigate}
      />
      <div className="pt-0">
        <CreatorSettings />
      </div>
    </div>
  );
} 