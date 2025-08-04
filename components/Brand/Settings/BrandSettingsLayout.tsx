
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Building2,
  Users,
  Bell,
  Shield,
  LogOut,
  Crown,
  Wallet
} from "lucide-react";

interface BrandSettingsLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const settingsNavigation = [
  { id: 'profile', label: 'Brand Profile', icon: Building2 },
  { id: 'account', label: 'Account Settings', icon: User },
  { id: 'billing', label: 'Billing & Escrow', icon: Wallet },
  { id: 'subscription', label: 'Subscription', icon: Crown },
  { id: 'team', label: 'Team Management', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

const BrandSettingsLayout = ({ children, activeSection, onSectionChange }: BrandSettingsLayoutProps) => {
  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logout clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your brand account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-1">
                {settingsNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "secondary" : "ghost"}
                      className={`w-full justify-start ${activeSection === item.id ? "bg-amber-300 hover:bg-yellow-700" : "bg-gray-100 hover:bg-gray-200"}`}
                      onClick={() => onSectionChange(item.id)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}

                <Separator className="my-4" />

                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSettingsLayout;
