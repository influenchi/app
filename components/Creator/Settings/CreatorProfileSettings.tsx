/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, Shield, Video, CheckCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, CreatorProfileData } from "@/lib/hooks/useCurrentUser";
import { validateImageFile, validateMediaFile, getFileTypeDisplay, getVideoTypeDisplay, getMaxFileSizeDisplay } from "@/lib/utils/storageUtils";

function guessMediaTypeFromUrl(url: string): 'image' | 'video' {
  const lower = url.toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) return 'video';
  return 'image';
}

const CreatorProfileSettings = () => {
  const [profileData, setProfileData] = useState({
    displayName: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    categories: [] as string[]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [vettingVideoUrl, setVettingVideoUrl] = useState("");
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const portfolioVideoInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { currentUser } = useCurrentUser();
  const creatorProfile = currentUser?.profile as CreatorProfileData | undefined;
  const isVetted = creatorProfile?.is_vetted || false;

  useEffect(() => {
    if (creatorProfile) {
      setProfileData({
        displayName: creatorProfile.display_name || '',
        username: creatorProfile.display_name ? `@${creatorProfile.display_name}` : '',
        bio: creatorProfile.bio || '',
        location: creatorProfile.location || '',
        website: creatorProfile.website || '',
        categories: [
          creatorProfile.primary_niche,
          ...(creatorProfile.secondary_niches || [])
        ].filter(Boolean)
      });
      setProfilePhoto(creatorProfile.profile_photo || null);
    }
  }, [creatorProfile]);

  useEffect(() => {
    const portfolioImagesData = creatorProfile?.portfolio_images || (creatorProfile as any)?.portfolioImages || [];
    setPortfolioImages(portfolioImagesData);
  }, [creatorProfile?.portfolio_images, creatorProfile]);

  const handleSave = async () => {
    try {
      const body: any = {
        bio: profileData.bio,
        website: profileData.website,
        primary_niche: profileData.categories[0] || null,
        secondary_niches: profileData.categories.slice(1),
      };
      if (profilePhoto) body.profile_photo = profilePhoto;

      const res = await fetch(`/api/creator/profile/${currentUser?.user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to save profile');
      toast({ title: 'Profile updated' });
      setIsEditing(false);
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again', variant: 'destructive' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const addCategory = () => {
    if (newCategory.trim() && !profileData.categories.includes(newCategory.trim())) {
      setProfileData(prev => ({ ...prev, categories: [...prev.categories, newCategory.trim()] }));
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setProfileData(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }));
  };

  const handleChangeProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({ title: 'Invalid file', description: validation.error, variant: 'destructive' });
      return;
    }
    try {
      const { uploadBrandLogo } = await import('@/lib/utils/storageUtils');
      const url = await uploadBrandLogo(file, currentUser?.user?.id || '');
      setProfilePhoto(url);
      toast({ title: 'Profile photo updated' });
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload photo', variant: 'destructive' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePortfolioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPortfolio(true);
    try {
      const { uploadPortfolioImages } = await import('@/lib/utils/storageUtils');
      const result = await uploadPortfolioImages(Array.from(files), currentUser?.user?.id || '');

      if (result.urls && result.urls.length > 0) {
        const updated = [...portfolioImages, ...result.urls].slice(0, 5);
        setPortfolioImages(updated);
        await fetch(`/api/creator/profile/${currentUser?.user?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ portfolio_images: updated })
        });
        toast({ title: 'Portfolio updated', description: `${result.urls.length} item(s) added.` });
      }

      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(error => {
          toast({ title: 'Upload error', description: error, variant: 'destructive' });
        });
      }
    } catch {
      toast({ title: 'Upload failed', description: 'Failed to upload portfolio items', variant: 'destructive' });
    } finally {
      setIsUploadingPortfolio(false);
      if (portfolioInputRef.current) portfolioInputRef.current.value = '';
      if (portfolioVideoInputRef.current) portfolioVideoInputRef.current.value = '';
    }
  };

  const removePortfolioImage = async (index: number) => {
    try {
      const updated = portfolioImages.filter((_, i) => i !== index);
      setPortfolioImages(updated);
      await fetch(`/api/creator/profile/${currentUser?.user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ portfolio_images: updated })
      });
      toast({ title: 'Removed from portfolio' });
    } catch {
      toast({ title: 'Update failed', description: 'Could not update portfolio', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile details and content categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profilePhoto || ''} />
              <AvatarFallback>{(profileData.displayName || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleChangeProfilePhoto} />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a profile photo ({getFileTypeDisplay()}, {getMaxFileSizeDisplay()} max)
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={profileData.displayName} onChange={(e) => handleInputChange('displayName', e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={profileData.username} onChange={(e) => handleInputChange('username', e.target.value)} disabled={!isEditing} />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={profileData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} disabled={!isEditing} rows={4} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={profileData.location} onChange={(e) => handleInputChange('location', e.target.value)} disabled={!isEditing} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={profileData.website} onChange={(e) => handleInputChange('website', e.target.value)} disabled={!isEditing} />
            </div>
          </div>

          {/* Content Categories */}
          <div>
            <Label>Content Categories</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {profileData.categories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  {isEditing && (
                    <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => removeCategory(category)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input placeholder="Add new category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addCategory()} />
                <Button onClick={addCategory} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Portfolio */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Upload className="h-4 w-4" />
              Portfolio ({portfolioImages.length}/5)
            </Label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {portfolioImages.map((mediaUrl, index) => {
                const mediaType = guessMediaTypeFromUrl(mediaUrl);
                return (
                  <Card key={index} className="relative group overflow-hidden">
                    <CardContent className="p-2">
                      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                        {mediaType === 'video' ? (
                          <video src={mediaUrl} className="w-full h-full object-cover" controls playsInline muted onError={() => {/* noop */ }} />
                        ) : (
                          <img src={mediaUrl} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                        )}
                        <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePortfolioImage(index)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {portfolioImages.length < 5 && (
                <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors cursor-pointer" onClick={() => portfolioInputRef.current?.click()}>
                  <CardContent className="p-4">
                    <div className="aspect-square flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors">
                      {isUploadingPortfolio ? (
                        <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mb-2" />
                          <span className="text-sm font-medium">Add Images</span>
                          <span className="text-xs">{getFileTypeDisplay()}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {portfolioImages.length < 5 && (
                <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors cursor-pointer" onClick={() => portfolioVideoInputRef.current?.click()}>
                  <CardContent className="p-4">
                    <div className="aspect-square flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors">
                      {isUploadingPortfolio ? (
                        <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Video className="h-8 w-8 mb-2" />
                          <span className="text-sm font-medium">Add Videos</span>
                          <span className="text-xs">{getVideoTypeDisplay()}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <input ref={portfolioInputRef} id="portfolio-upload" type="file" accept="image/*" multiple onChange={handlePortfolioUpload} className="hidden" disabled={isUploadingPortfolio || portfolioImages.length >= 5} />
            <input ref={portfolioVideoInputRef} id="portfolio-upload-video" type="file" accept="video/*" multiple onChange={handlePortfolioUpload} className="hidden" disabled={isUploadingPortfolio || portfolioImages.length >= 5} />

            <p className="text-sm text-muted-foreground">
              Upload up to 5 portfolio items (images and short videos). Max {getMaxFileSizeDisplay()} per file.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vetting Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Creator Verification</CardTitle>
          <CardDescription>Get verified to increase your visibility and credibility with brands</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVetted ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">You&apos;re verified!</p>
                <p className="text-sm text-green-700 dark:text-green-300">Your profile has been verified and you&apos;ll appear first in brand searches.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">How to get verified:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Create a short video (30-60 seconds) introducing yourself</li>
                  <li>Mention your niche and showcase your content style</li>
                  <li>Upload the video to your social media platform</li>
                  <li>Submit the video link below for review</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vettingVideo" className="flex items-center gap-2"><Video className="h-4 w-4" />Verification Video URL</Label>
                <Input id="vettingVideo" type="url" placeholder="https://www.instagram.com/reel/..." value={vettingVideoUrl} onChange={(e) => setVettingVideoUrl(e.target.value)} />
                <p className="text-xs text-muted-foreground">Submit a link to your verification video from Instagram, TikTok, or YouTube</p>
              </div>

              <Button onClick={() => {/* handled elsewhere */ }} disabled={isSubmittingVideo} className="w-full">
                {isSubmittingVideo ? "Submitting..." : "Submit for Verification"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorProfileSettings;
