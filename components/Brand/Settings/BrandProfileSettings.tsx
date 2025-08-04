
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Globe, Instagram, Twitter, Linkedin, Youtube, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BrandProfileSettings = () => {
  const [profileData, setProfileData] = useState({
    brand_name: "",
    website: "",
    description: "",
    logo: "",
    industries: [] as string[],
    social_media: {
      instagram: "",
      twitter: "",
      linkedin: "",
      tiktok: "",
      youtube: ""
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch brand profile on component mount
  useEffect(() => {
    fetchBrandProfile();
  }, []);

  const fetchBrandProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/brand/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.brandProfile) {
          setProfileData({
            brand_name: data.brandProfile.brand_name || "",
            website: data.brandProfile.website || "",
            description: data.brandProfile.description || "",
            logo: data.brandProfile.logo || "",
            industries: data.brandProfile.industries || [],
            social_media: data.brandProfile.social_media || {
              instagram: "",
              twitter: "",
              linkedin: "",
              tiktok: "",
              youtube: ""
            }
          });
        }
      } else {
        console.error('Failed to fetch brand profile');
      }
    } catch (error) {
      console.error('Error fetching brand profile:', error);
      toast.error('Failed to load brand profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/brand/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({
          brand_name: data.brandProfile.brand_name || "",
          website: data.brandProfile.website || "",
          description: data.brandProfile.description || "",
          logo: data.brandProfile.logo || "",
          industries: data.brandProfile.industries || [],
          social_media: data.brandProfile.social_media || {
            instagram: "",
            twitter: "",
            linkedin: "",
            tiktok: "",
            youtube: ""
          }
        });
        setIsEditing(false);
        toast.success('Brand profile updated successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update brand profile');
      }
    } catch (error) {
      console.error('Error saving brand profile:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('social_media.')) {
      const socialField = field.replace('social_media.', '');
      setProfileData(prev => ({
        ...prev,
        social_media: {
          ...prev.social_media,
          [socialField]: value
        }
      }));
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading brand profile...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand Profile</CardTitle>
          <CardDescription>
            Manage your brand information and public profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profileData.logo || undefined} alt="Brand logo" />
              <AvatarFallback className="text-lg">
                {profileData.brand_name ? profileData.brand_name.charAt(0).toUpperCase() : 'B'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" disabled={!isEditing}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                Recommended: 400x400px, max 2MB
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="brandName">Brand Name</Label>
              <Input
                id="brandName"
                value={profileData.brand_name}
                onChange={(e) => handleInputChange('brand_name', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your brand name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Brand Description</Label>
            <Textarea
              id="description"
              value={profileData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={!isEditing}
              rows={3}
              placeholder="Describe your brand, what you do, and what makes you unique"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-medium">Social Media & Website</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="https://yourbrand.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    value={profileData.social_media.instagram}
                    onChange={(e) => handleInputChange('social_media.instagram', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="@yourbrand"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="twitter"
                    value={profileData.social_media.twitter}
                    onChange={(e) => handleInputChange('social_media.twitter', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="@yourbrand"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    value={profileData.social_media.linkedin}
                    onChange={(e) => handleInputChange('social_media.linkedin', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="company/yourbrand"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tiktok">TikTok</Label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="tiktok"
                    value={profileData.social_media.tiktok}
                    onChange={(e) => handleInputChange('social_media.tiktok', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="@yourbrand"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="youtube"
                    value={profileData.social_media.youtube}
                    onChange={(e) => handleInputChange('social_media.youtube', e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                    placeholder="@yourbrand"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
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
    </div>
  );
};

export default BrandProfileSettings;
