"use client";

import UserTypeSelection from "@/components/UserTypeSelection";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleUserTypeSelect = (type: 'brand' | 'creator') => {
    router.push(`/signup?type=${type}`);
  };

  return (
    <div className="min-h-screen">
      <UserTypeSelection onSelectType={handleUserTypeSelect} />
    </div>
  );
}
