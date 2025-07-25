
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Instagram, Youtube, Twitter, Globe, Zap } from "lucide-react";
import { CreatorProfileData } from "../types";

interface SocialProfilesStepProps {
  profileData: CreatorProfileData;
  onUpdateData: (field: string, value: string | File | string[] | null) => void;
}

const SocialProfilesStep = ({ profileData, onUpdateData }: SocialProfilesStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Connect your social media accounts to showcase your reach and engagement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instagram */}
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-500" />
            <Input
              id="instagram"
              value={profileData.instagram}
              onChange={(e) => onUpdateData('instagram', e.target.value)}
              placeholder="@yourusername"
              className="pl-10"
            />
          </div>
        </div>

        {/* TikTok */}
        <div>
          <Label htmlFor="tiktok">TikTok</Label>
          <div className="relative">
            <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
            <Input
              id="tiktok"
              value={profileData.tiktok}
              onChange={(e) => onUpdateData('tiktok', e.target.value)}
              placeholder="@yourusername"
              className="pl-10"
            />
          </div>
        </div>

        {/* YouTube */}
        <div>
          <Label htmlFor="youtube">YouTube</Label>
          <div className="relative">
            <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
            <Input
              id="youtube"
              value={profileData.youtube}
              onChange={(e) => onUpdateData('youtube', e.target.value)}
              placeholder="@yourchannel or channel URL"
              className="pl-10"
            />
          </div>
        </div>

        {/* Twitter */}
        <div>
          <Label htmlFor="twitter">Twitter / X</Label>
          <div className="relative">
            <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
            <Input
              id="twitter"
              value={profileData.twitter}
              onChange={(e) => onUpdateData('twitter', e.target.value)}
              placeholder="@yourusername"
              className="pl-10"
            />
          </div>
        </div>

        {/* Website */}
        <div className="md:col-span-2">
          <Label htmlFor="website">Website / Blog</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
            <Input
              id="website"
              value={profileData.website}
              onChange={(e) => onUpdateData('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Include https:// or http:// (e.g., https://example.com)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 p-4 rounded-lg">
        <p className="text-sm text-orange-800">
          <strong>Pro Tip:</strong> Adding your social profiles helps brands understand your reach and content style.
          You can always update these later in your profile settings.
        </p>
      </div>
    </div>
  );
};

export default SocialProfilesStep;
