
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Check } from "lucide-react";
import { CreatorProfileData } from "../types";
import { cn } from "@/lib/utils";

interface AudienceInfoStepProps {
  profileData: CreatorProfileData;
  onUpdateData: (field: string, value: unknown) => void;
}

const followerRanges = [
  "1K - 5K",
  "5K - 10K",
  "10K - 50K",
  "50K - 100K",
  "100K - 500K",
  "500K - 1M",
  "1M+"
];

const platforms = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter",
  "Multiple Platforms"
];

const ageRanges = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+"
];

const genderOptions = [
  "Mostly Female (60%+)",
  "Mostly Male (60%+)",
  "Balanced Mix",
  "Other/Non-binary"
];

const locationOptions = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Europe",
  "Asia",
  "Global/Mixed"
];

const AudienceInfoStep = ({ profileData, onUpdateData }: AudienceInfoStepProps) => {
  const toggleSelection = (array: string[], item: string, field: string) => {
    const currentArray = array || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    onUpdateData(field, newArray);
  };

  const renderSelectableBadge = (
    item: string,
    isSelected: boolean,
    onClick: () => void,
    color: 'orange' | 'blue' | 'purple' | 'green' = 'orange'
  ) => {
    const colorClasses = {
      orange: {
        selected: 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700',
        unselected: 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:text-orange-600'
      },
      blue: {
        selected: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
        unselected: 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
      },
      purple: {
        selected: 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700',
        unselected: 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:text-purple-600'
      },
      green: {
        selected: 'bg-green-600 text-white border-green-600 hover:bg-green-700',
        unselected: 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-600'
      }
    };

    return (
      <button
        key={item}
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
          isSelected ? colorClasses[color].selected : colorClasses[color].unselected,
          "transform active:scale-95"
        )}
      >
        {isSelected && <Check className="h-3 w-3" />}
        {item}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 text-orange-600 mx-auto mb-2" />
        <p className="text-gray-600">
          Share insights about your audience to help brands understand your reach
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Followers */}
        <div>
          <Label>Total Followers Range *</Label>
          <Select
            value={profileData.totalFollowers}
            onValueChange={(value) => onUpdateData('totalFollowers', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select follower range" />
            </SelectTrigger>
            <SelectContent>
              {followerRanges.map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {profileData.totalFollowers && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Follower range selected: {profileData.totalFollowers}
            </p>
          )}
        </div>

        {/* Primary Platform */}
        <div>
          <Label>Primary Platform *</Label>
          <Select
            value={profileData.primaryPlatform}
            onValueChange={(value) => onUpdateData('primaryPlatform', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Your main platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>{platform}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {profileData.primaryPlatform && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Primary platform: {profileData.primaryPlatform}
            </p>
          )}
        </div>
      </div>

      {/* Engagement Rate */}
      <div>
        <Label htmlFor="engagementRate">Average Engagement Rate</Label>
        <div className="relative mt-2">
          <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="engagementRate"
            value={profileData.engagementRate}
            onChange={(e) => onUpdateData('engagementRate', e.target.value)}
            placeholder="e.g., 3.5% or 'High' or 'Don't know'"
            className="pl-10"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          If you&apos;re unsure, you can estimate or leave this blank
        </p>
      </div>

      {/* Audience Age */}
      <div>
        <Label>Audience Age Demographics</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select the age ranges that best represent your audience
        </p>
        <div className="flex flex-wrap gap-2">
          {ageRanges.map((age) => (
            renderSelectableBadge(
              age,
              profileData.audienceAge?.includes(age) || false,
              () => toggleSelection(profileData.audienceAge, age, 'audienceAge'),
              'blue'
            )
          ))}
        </div>
        {profileData.audienceAge && profileData.audienceAge.length > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            {profileData.audienceAge.length} age range{profileData.audienceAge.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Audience Gender */}
      <div>
        <Label>Audience Gender Split</Label>
        <Select
          value={profileData.audienceGender}
          onValueChange={(value) => onUpdateData('audienceGender', value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select gender demographics" />
          </SelectTrigger>
          <SelectContent>
            {genderOptions.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {profileData.audienceGender && (
          <p className="text-sm text-green-600 mt-1">
            ✓ Gender split: {profileData.audienceGender}
          </p>
        )}
      </div>

      {/* Audience Location */}
      <div>
        <Label>Audience Geographic Distribution</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Where is your audience primarily located? (Select all that apply)
        </p>
        <div className="flex flex-wrap gap-2">
          {locationOptions.map((location) => (
            renderSelectableBadge(
              location,
              profileData.audienceLocation?.includes(location) || false,
              () => toggleSelection(profileData.audienceLocation, location, 'audienceLocation'),
              'purple'
            )
          ))}
        </div>
        {profileData.audienceLocation && profileData.audienceLocation.length > 0 && (
          <p className="text-sm text-purple-600 mt-2">
            {profileData.audienceLocation.length} location{profileData.audienceLocation.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Privacy Note:</strong> This information helps brands match you with relevant campaigns.
          Exact follower counts and detailed analytics remain private until you choose to share them.
        </p>
      </div>
    </div>
  );
};

export default AudienceInfoStep;
