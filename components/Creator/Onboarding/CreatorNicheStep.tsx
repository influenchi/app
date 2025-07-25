/* eslint-disable @typescript-eslint/no-explicit-any */

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreatorProfileData } from "../types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorNicheStepProps {
  profileData: CreatorProfileData;
  onUpdateData: (field: string, value: any) => void;
}

const primaryNiches = [
  "Adventure Travel",
  "Luxury Travel",
  "Budget Travel",
  "Solo Travel",
  "Family Travel",
  "Food & Culinary",
  "Photography",
  "Lifestyle",
  "Wellness & Fitness",
  "Cultural Travel"
];

const secondaryNiches = [
  "Backpacking",
  "Road Trips",
  "City Breaks",
  "Beach & Islands",
  "Mountains & Hiking",
  "Wildlife & Nature",
  "Hotels & Accommodation",
  "Local Experiences",
  "Sustainable Travel",
  "Digital Nomad"
];

const travelStyles = [
  "Authentic & Local",
  "Luxury & Premium",
  "Adventure & Active",
  "Relaxed & Slow",
  "Fast-paced & Efficient",
  "Off-the-beaten-path",
  "Popular Destinations",
  "Budget-conscious",
  "Sustainable & Eco-friendly"
];

const contentTypes = [
  "Photos",
  "Videos",
  "Reels/Short-form",
  "Stories",
  "Blog Posts",
  "Reviews",
  "Tutorials",
  "Behind-the-scenes",
  "Live Content"
];

const CreatorNicheStep = ({ profileData, onUpdateData }: CreatorNicheStepProps) => {
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
        <p className="text-gray-600">
          Help brands find you by defining your content niche and travel style
        </p>
      </div>

      {/* Primary Niche */}
      <div>
        <Label>Primary Travel Niche *</Label>
        <Select
          value={profileData.primaryNiche}
          onValueChange={(value) => onUpdateData('primaryNiche', value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select your main focus area" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black overflow-y-auto max-h-[300px]">
            {primaryNiches.map((niche) => (
              <SelectItem key={niche} value={niche}>{niche}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {profileData.primaryNiche && (
          <p className="text-sm text-green-600 mt-1">
            ✓ Primary niche selected: {profileData.primaryNiche}
          </p>
        )}
      </div>

      {/* Secondary Niches */}
      <div>
        <Label>Secondary Niches</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select additional areas you create content about (optional)
        </p>
        <div className="flex flex-wrap gap-2">
          {secondaryNiches.map((niche) => (
            renderSelectableBadge(
              niche,
              profileData.secondaryNiches?.includes(niche) || false,
              () => toggleSelection(profileData.secondaryNiches, niche, 'secondaryNiches'),
              'blue'
            )
          ))}
        </div>
        {profileData.secondaryNiches && profileData.secondaryNiches.length > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            {profileData.secondaryNiches.length} secondary niche{profileData.secondaryNiches.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Travel Style */}
      <div>
        <Label>Travel Style *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          How would you describe your travel approach? (Select all that apply)
        </p>
        <div className="flex flex-wrap gap-2">
          {travelStyles.map((style) => (
            renderSelectableBadge(
              style,
              profileData.travelStyle?.includes(style) || false,
              () => toggleSelection(profileData.travelStyle, style, 'travelStyle'),
              'purple'
            )
          ))}
        </div>
        {profileData.travelStyle && profileData.travelStyle.length > 0 && (
          <p className="text-sm text-purple-600 mt-2">
            {profileData.travelStyle.length} travel style{profileData.travelStyle.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Content Types */}
      <div>
        <Label>Content Types *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          What type of content do you primarily create? (Select all that apply)
        </p>
        <div className="flex flex-wrap gap-2">
          {contentTypes.map((type) => (
            renderSelectableBadge(
              type,
              profileData.contentTypes?.includes(type) || false,
              () => toggleSelection(profileData.contentTypes, type, 'contentTypes'),
              'green'
            )
          ))}
        </div>
        {profileData.contentTypes && profileData.contentTypes.length > 0 && (
          <p className="text-sm text-green-600 mt-2">
            {profileData.contentTypes.length} content type{profileData.contentTypes.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Being specific about your niche helps brands find creators who are the perfect fit for their campaigns.
          You can always update these preferences later.
        </p>
      </div>
    </div>
  );
};

export default CreatorNicheStep;
