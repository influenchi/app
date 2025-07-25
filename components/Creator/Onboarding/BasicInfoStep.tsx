
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, User, MapPin, X, Info, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { CreatorProfileData } from "../types";
import { useRef, useState } from "react";
import { validateImageFile, getFileTypeDisplay, getMaxFileSizeDisplay } from "@/lib/utils/storageUtils";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDisplayNameCheck } from "@/lib/hooks/useDisplayNameCheck";
import { cn } from "@/lib/utils";

interface BasicInfoStepProps {
  profileData: CreatorProfileData;
  onUpdateData: (field: string, value: unknown) => void;
}

const BasicInfoStep = ({ profileData, onUpdateData }: BasicInfoStepProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check display name availability
  const displayNameCheck = useDisplayNameCheck(profileData.displayName, true);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    onUpdateData('profileImage', file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onUpdateData('profileImage', null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onUpdateData('displayName', suggestion);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={imagePreview || (profileData.profileImage ? URL.createObjectURL(profileData.profileImage) : "")} />
            <AvatarFallback className="text-xl bg-orange-100 text-orange-600">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              {(imagePreview || profileData.profileImage) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Supported: {getFileTypeDisplay()}, max {getMaxFileSizeDisplay()}
            </p>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="firstName">First Name *</Label>
              {profileData.firstName && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Pre-filled from your account</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Input
              id="firstName"
              value={profileData.firstName}
              onChange={(e) => onUpdateData('firstName', e.target.value)}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="lastName">Last Name *</Label>
              {profileData.lastName && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Pre-filled from your account</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <Input
              id="lastName"
              value={profileData.lastName}
              onChange={(e) => onUpdateData('lastName', e.target.value)}
              placeholder="Enter your last name"
            />
          </div>
        </div>

        {/* Display Name with availability check */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Label htmlFor="displayName">Display Name / Handle *</Label>
            {displayNameCheck.isChecking && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
            {!displayNameCheck.isChecking && displayNameCheck.available === true && (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
            {!displayNameCheck.isChecking && displayNameCheck.available === false && (
              <XCircle className="h-3 w-3 text-red-600" />
            )}
          </div>
          <Input
            id="displayName"
            value={profileData.displayName}
            onChange={(e) => onUpdateData('displayName', e.target.value)}
            placeholder="@yourusername or Your Brand Name"
            className={cn(
              !displayNameCheck.isChecking && displayNameCheck.available === true && "border-green-500 focus:ring-green-500",
              !displayNameCheck.isChecking && displayNameCheck.available === false && "border-red-500 focus:ring-red-500"
            )}
          />
          {displayNameCheck.message && (
            <p className={cn(
              "text-sm mt-1",
              displayNameCheck.available === true ? "text-green-600" : "text-red-600"
            )}>
              {displayNameCheck.message}
            </p>
          )}
          {displayNameCheck.suggestions && displayNameCheck.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-1">Try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {displayNameCheck.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            This is how brands will see you on the platform
          </p>
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio">Bio *</Label>
          <Textarea
            id="bio"
            value={profileData.bio}
            onChange={(e) => onUpdateData('bio', e.target.value)}
            placeholder="Tell us about yourself, your content style, and what makes you unique..."
            rows={4}
            maxLength={500}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {profileData.bio.length}/500 characters
          </p>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) => onUpdateData('location', e.target.value)}
              placeholder="City, State/Country"
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            This helps brands find creators in specific locations
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BasicInfoStep;
