"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Briefcase, Camera, Home, Settings, LogOut, ChevronDown } from "lucide-react";
import NotificationDropdown from "./Notifications/NotificationDropdown";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";

interface NavigationProps {
  currentView?: string;
  onNavigate?: (view: string, campaignId?: string, tab?: string) => void;
}

const Navigation = ({ currentView, onNavigate }: NavigationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isLoading, isAuthenticated } = useCurrentUser();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // Determine user type from authenticated user
  const isCreator = currentUser?.user.user_type === 'creator';
  const isBrand = currentUser?.user.user_type === 'brand';

  // Get display name and avatar
  const getDisplayName = () => {
    if (!currentUser) return 'Guest';

    if (isCreator && currentUser.profile && 'display_name' in currentUser.profile) {
      return currentUser.profile.display_name;
    }
    if (isBrand && currentUser.profile && 'company_name' in currentUser.profile) {
      return currentUser.profile.company_name;
    }
    return currentUser.user.name || currentUser.user.email || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarUrl = () => {
    if (isCreator && currentUser?.profile && 'profile_photo' in currentUser.profile) {
      return currentUser.profile.profile_photo || undefined;
    }
    if (isBrand && currentUser?.profile && 'logo_url' in currentUser.profile) {
      return currentUser.profile.logo_url || undefined;
    }
    return undefined;
  };

  return (
    <header className="bg-background backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center space-x-2 mr-8">
              <Image
                src="/lovable-uploads/9208da4e-c82f-4d70-9563-87a55fe2857f.png"
                alt="Influenchi Logo"
                className="h-8 w-8 rounded-full"
                width={32}
                height={32}
              />
              <span className="text-2xl font-bold text-foreground">Influenchi</span>
            </div>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href={isAuthenticated ? (isBrand ? "/brand/dashboard" : "/creator/dashboard") : "/"} passHref>
                    <Button
                      variant={pathname === '/' || pathname === '/brand/dashboard' || pathname === '/creator/dashboard' ? "default" : "ghost"}
                      className="flex items-center"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      {isAuthenticated ? (isBrand ? "Dashboard" : "Dashboard") : "Home"}
                    </Button>
                  </Link>
                </NavigationMenuItem>

                {/* Show only brand navigation for brand users */}
                {isBrand && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Brand
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-4 w-[200px] bg-background backdrop-blur-md">
                        {!currentUser?.profile?.is_onboarding_complete && (
                          <Link href="/brand/onboarding" passHref>
                            <Button
                              variant="ghost"
                              className="justify-start w-full"
                            >
                              Setup Profile
                            </Button>
                          </Link>
                        )}
                        <Link href="/brand/dashboard" passHref>
                          <Button
                            variant="ghost"
                            className="justify-start w-full"
                          >
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/brand/settings" passHref>
                          <Button
                            variant="ghost"
                            className="justify-start w-full"
                          >
                            Settings
                          </Button>
                        </Link>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {/* Show only creator navigation for creator users */}
                {isCreator && (
                  <>
                    <NavigationMenuItem>
                      <Link href="/creator/dashboard" passHref>
                        <Button
                          variant={pathname === '/creator/dashboard' ? "default" : "ghost"}
                          className="flex items-center"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                    </NavigationMenuItem>
                    {!currentUser?.profile?.is_onboarding_complete && (
                      <NavigationMenuItem>
                        <Link href="/creator/onboarding" passHref>
                          <Button
                            variant="ghost"
                            className="flex items-center"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Complete Profile
                          </Button>
                        </Link>
                      </NavigationMenuItem>
                    )}
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <NotificationDropdown onNavigate={onNavigate || (() => { })} />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={getAvatarUrl()}
                        alt={isCreator ? "Creator Profile" : "Brand Logo"}
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {getDisplayName()}
                      </span>
                      {isCreator && currentUser?.profile && 'display_name' in currentUser.profile && (
                        <span className="text-xs text-muted-foreground">
                          @{currentUser.profile.display_name}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background backdrop-blur-md border shadow-lg">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser?.user.first_name && currentUser?.user.last_name
                          ? `${currentUser.user.first_name} ${currentUser.user.last_name}`
                          : getDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push(isCreator ? '/creator/settings' : '/brand/settings')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
