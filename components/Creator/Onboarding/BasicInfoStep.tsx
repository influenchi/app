
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, User, X, Info, CheckCircle, XCircle, Loader2 } from "lucide-react";
import ModernSingleLocationAutocomplete from "@/components/ui/modern-single-location-autocomplete";
import { CreatorProfileData } from "../types";
import { useRef, useState, useEffect } from "react";
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
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check display name availability
  const displayNameCheck = useDisplayNameCheck(profileData.displayName, true);

  // Handle existing profile image URL or File
  useEffect(() => {
    if (typeof profileData.profileImage === 'string') {
      // It's already an uploaded URL
      setProfileImageUrl(profileData.profileImage);
      setImagePreview(null);
    } else if (profileData.profileImage instanceof File && !imagePreview) {
      // It's a File object, create preview
      const url = URL.createObjectURL(profileData.profileImage);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [profileData.profileImage, imagePreview]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    // Set uploading state and show preview
    setIsUploading(true);
    setUploadError(null);

    // Create immediate preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Clear any existing profile image URL
    if (profileImageUrl) {
      setProfileImageUrl(null);
    }

    try {

      // Upload to dedicated profile image endpoint
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/creator-profile', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorResp = await response.json();
        throw new Error(errorResp.error || 'Upload failed');
      }

      const result: { url?: string; path?: string } = await response.json();

      if (result.url) {
        // Clean up preview blob and use uploaded URL
        URL.revokeObjectURL(previewUrl);
        setImagePreview(null);
        setProfileImageUrl(result.url);

        // Update form with URL instead of File
        onUpdateData('profileImage', result.url);

        toast.success('Profile image uploaded successfully!');
      } else {
        throw new Error('No URL returned from upload');
      }

    } catch (error) {
      console.error('🖼️ BasicInfoStep: Profile image upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      toast.error(error instanceof Error ? error.message : 'Failed to upload profile image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {

    onUpdateData('profileImage', null);

    // Clean up preview blob if it exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

    // Clear uploaded URL (don't revoke as it's not a blob)
    setProfileImageUrl(null);
    setUploadError(null);

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
          <div className="relative">
            <Avatar className="h-24 w-24 flex-shrink-0">
              <AvatarImage
                src={profileImageUrl || imagePreview || ""}
                className="object-cover"
              />
              <AvatarFallback className="text-xl bg-orange-100 text-orange-600">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
            {profileImageUrl && !isUploading && (
              <div className="absolute -top-2 -right-2 bg-green-600 text-white p-1 rounded-full">
                <CheckCircle className="h-4 w-4" />
              </div>
            )}
            {uploadError && !isUploading && (
              <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full">
                <XCircle className="h-4 w-4" />
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </Button>
              {(imagePreview || profileImageUrl || profileData.profileImage) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Supported: {getFileTypeDisplay()}, max {getMaxFileSizeDisplay()}
            </p>
            {uploadError && (
              <p className="text-sm text-red-600 mt-1">
                {uploadError}
              </p>
            )}
            {profileImageUrl && !uploadError && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Image uploaded successfully
              </p>
            )}
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
          <ModernSingleLocationAutocomplete
            value={profileData.location}
            onChange={(value) => onUpdateData('location', value)}
            placeholder="Enter your city, state/country..."
          />
          <p className="text-sm text-muted-foreground mt-1">
            This helps brands find creators in specific locations
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BasicInfoStep;
