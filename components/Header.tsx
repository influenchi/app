
import { Button } from "@/components/ui/button";
import { Users, Briefcase } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const Header = ({ onLoginClick, onSignupClick }: HeaderProps) => {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Image
              src="/lovable-uploads/9208da4e-c82f-4d70-9563-87a55fe2857f.png"
              alt="Influenchi Logo"
              className="h-8 w-8 rounded-full"
              width={32}
              height={32}
            />
            <span className="text-2xl font-bold text-gray-900">Influenchi</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How it works
            </a>
            <a href="#for-brands" className="text-gray-600 hover:text-gray-900 transition-colors">
              For Brands
            </a>
            <a href="#for-creators" className="text-gray-600 hover:text-gray-900 transition-colors">
              For Creators
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onLoginClick}>
              Log in
            </Button>
            <Button onClick={onSignupClick} className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
