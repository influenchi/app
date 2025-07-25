
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, Shield, Video, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, CreatorProfileData } from "@/lib/hooks/useCurrentUser";

const CreatorProfileSettings = () => {
  const [profileData, setProfileData] = useState({
    displayName: "Sarah Johnson",
    username: "@sarahcreates",
    bio: "Lifestyle and fashion content creator passionate about sustainable living and authentic storytelling.",
    location: "Los Angeles, CA",
    website: "https://sarahcreates.com",
    categories: ["Lifestyle", "Fashion", "Sustainability"]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [vettingVideoUrl, setVettingVideoUrl] = useState("");
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useCurrentUser();
  const creatorProfile = currentUser?.profile as CreatorProfileData | undefined;
  const isVetted = creatorProfile?.is_vetted || false;

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const addCategory = () => {
    if (newCategory.trim() && !profileData.categories.includes(newCategory.trim())) {
      setProfileData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setProfileData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const handleSubmitVettingVideo = async () => {
    if (!vettingVideoUrl.trim()) {
      toast({
        title: "Video URL required",
        description: "Please enter a valid video URL",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingVideo(true);
    try {
      const response = await fetch('/api/creator/submit-vetting-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: vettingVideoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit video');
      }

      toast({
        title: "Video submitted!",
        description: "Your verification video has been submitted for review. We'll notify you once it's approved.",
      });
      setVettingVideoUrl("");
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to submit your verification video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingVideo(false);
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
              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b602?w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a profile photo (JPG, PNG, max 5MB)
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={profileData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profileData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={profileData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!isEditing}
              />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeCategory(category)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <Button onClick={addCategory} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vetting Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Creator Verification
          </CardTitle>
          <CardDescription>
            Get verified to increase your visibility and credibility with brands
          </CardDescription>
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
                <Label htmlFor="vettingVideo" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Verification Video URL
                </Label>
                <Input
                  id="vettingVideo"
                  type="url"
                  placeholder="https://www.instagram.com/reel/..."
                  value={vettingVideoUrl}
                  onChange={(e) => setVettingVideoUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Submit a link to your verification video from Instagram, TikTok, or YouTube
                </p>
              </div>

              <Button
                onClick={handleSubmitVettingVideo}
                disabled={isSubmittingVideo}
                className="w-full"
              >
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
