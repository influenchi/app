
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Check } from "lucide-react";
import { CampaignData } from "./types";
import { socialChannels, travelNiches, audienceSizeOptions, ageRangeOptions, genderOptions, ethnicityOptions } from "./constants";
import MultiSelect from "./MultiSelect";
import ModernLocationAutocomplete from "@/components/ui/modern-location-autocomplete";

interface TargetAudienceStepProps {
  campaignData: CampaignData;
  onUpdateTargetAudience: (field: string, value: string | string[]) => void;
  onToggleInterest: (interest: string) => void;
  onUpdate: (field: string, value: string) => void;
}

const TargetAudienceStep = ({ campaignData, onUpdateTargetAudience, onToggleInterest, onUpdate }: TargetAudienceStepProps) => {
  const isDistributionGoal = campaignData.campaignGoal.includes('Content Distribution');

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center">
        <Users className="h-5 w-5 mr-2" />
        Target Audience
      </h3>

      <div>
        <Label htmlFor="creatorCount">Number of Creators Needed <span className="text-red-500">*</span></Label>
        <Input
          id="creatorCount"
          type="number"
          min="1"
          value={campaignData.creatorCount}
          onChange={(e) => onUpdate('creatorCount', e.target.value)}
          placeholder="5"
          className={!campaignData.creatorCount?.trim() || Number(campaignData.creatorCount) < 1 ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}
        />
      </div>

      {isDistributionGoal && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>Primary Social Channel <span className="text-red-500">*</span></Label>
            <Select
              value={campaignData.targetAudience.socialChannel}
              onValueChange={(value) => onUpdateTargetAudience('socialChannel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary channel" />
              </SelectTrigger>
              <SelectContent>
                {socialChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Audience Size <span className="text-red-500">*</span></Label>
            <MultiSelect
              options={audienceSizeOptions}
              selected={campaignData.targetAudience.audienceSize}
              onSelectionChange={(selected) => onUpdateTargetAudience('audienceSize', selected)}
              placeholder="Select audience sizes"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Gender</Label>
          <Select
            value={campaignData.targetAudience.gender}
            onValueChange={(value) => onUpdateTargetAudience('gender', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((gender) => (
                <SelectItem key={gender} value={gender}>{gender}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Age Range</Label>
          <MultiSelect
            options={ageRangeOptions}
            selected={campaignData.targetAudience.ageRange}
            onSelectionChange={(selected) => onUpdateTargetAudience('ageRange', selected)}
            placeholder="Select age ranges"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Ethnicity</Label>
          <Select
            value={campaignData.targetAudience.ethnicity}
            onValueChange={(value) => onUpdateTargetAudience('ethnicity', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select ethnicity" />
            </SelectTrigger>
            <SelectContent>
              {ethnicityOptions.map((ethnicity) => (
                <SelectItem key={ethnicity} value={ethnicity}>{ethnicity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Location</Label>
          <ModernLocationAutocomplete
            selected={campaignData.targetAudience.location}
            onSelectionChange={(selected) => onUpdateTargetAudience('location', selected)}
            placeholder="Search for target locations..."
          />
        </div>
      </div>

      <div>
        <Label>Interests & Niches</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select all that apply to your target audience
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {travelNiches.map((interest) => {
            const isSelected = campaignData.targetAudience.interests.includes(interest);
            return (
              <Badge
                key={interest}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${isSelected
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    : "hover:bg-blue-50 hover:border-blue-300"
                  }`}
                onClick={() => onToggleInterest(interest)}
              >
                {isSelected && <Check className="w-3 h-3 mr-1" />}
                {interest}
              </Badge>
            );
          })}
        </div>
        {campaignData.targetAudience.interests.length > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            {campaignData.targetAudience.interests.length} interest{campaignData.targetAudience.interests.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
};

export default TargetAudienceStep;
