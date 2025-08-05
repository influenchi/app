
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Star,
  Video,
  Clock,
  CheckCircle,
  Upload,
  Users,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, CreatorProfileData } from "@/lib/hooks/useCurrentUser";

const VettedCreatorHighlight = () => {
  const [postLink, setPostLink] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentUser, isLoading, refetch: refetchUser } = useCurrentUser();
  const creatorProfile = currentUser?.profile as CreatorProfileData | undefined;

  const isVetted = creatorProfile?.is_vetted || false;
  const hasCompletedProfile = creatorProfile?.is_onboarding_complete || false;
  const vettingStatus = creatorProfile?.vetting_status;

  const handleSubmit = async () => {
    if (!postLink.trim()) {
      toast({
        title: "Video URL required",
        description: "Please enter a valid post URL",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/creator/submit-vetting-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ videoUrl: postLink }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit video');
      }

      toast({
        title: "Application submitted!",
        description: "Your verification video has been submitted for review. We'll notify you within 72 hours.",
      });

      // Refetch user data to update the UI
      refetchUser();

    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Failed to submit your verification video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If not a creator or no user, don't show anything
  if (!currentUser || currentUser.user.user_type !== 'creator') {
    return null;
  }

  // If profile not completed, show a different message
  if (!hasCompletedProfile) {
    return (
      <Card className="border-2 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-yellow-400/5">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Complete Your Profile First</h3>
              <p className="text-sm text-muted-foreground">You need to complete your creator profile before applying for verification.</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/creator/settings">Complete Profile</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If dismissed or already vetted, don't show
  if (isDismissed || isVetted) {
    return null;
  }

  // If already vetted, show a different message
  if (false) { // This block is now unreachable but keeping structure
    return (
      <Card className="border-2 border-green-500/20 bg-gradient-to-r from-green-500/5 to-green-400/5">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">You&apos;re a Vetted Creator!</h3>
              <p className="text-sm text-muted-foreground">Your profile has been verified and you appear first in brand searches</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (vettingStatus === 'pending') {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Application Submitted!</h3>
              <p className="text-sm text-muted-foreground">We&apos;ll review your content within 72 hours</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Review in progress - you&apos;ll receive an email notification</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMinimized) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Become a Vetted Creator</h3>
                <p className="text-xs text-muted-foreground">Stand out and increase your collaboration opportunities</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16" />

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground flex items-center gap-2">
                Become a Vetted Creator
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Verified
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Stand out and increase your collaboration opportunities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Higher visibility</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Priority consideration</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Verified badge</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-background/50 rounded-lg p-4 border border-border/50">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            How to Apply
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                1
              </div>
              <div>
                <p className="text-foreground font-medium">Create UGC Content</p>
                <p className="text-muted-foreground">
                  Film a 30-second social content about Influenchi - showcase our platform, features, or your experience
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                2
              </div>
              <div>
                <p className="text-foreground font-medium">Share & Tag</p>
                <p className="text-muted-foreground">
                  Post on your social media and tag <span className="font-medium text-primary">@InfluenchiHQ</span>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                3
              </div>
              <div>
                <p className="text-foreground font-medium">Submit Link</p>
                <p className="text-muted-foreground">
                  Copy and paste the link to your post below
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submission Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="postLink" className="text-sm font-medium">
              Post Link <span className="text-destructive">*</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="postLink"
                placeholder="https://instagram.com/p/your-post-id or https://tiktok.com/@you/video/..."
                value={postLink}
                onChange={(e) => setPostLink(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSubmit}
                disabled={!postLink.trim() || isSubmitting}
                className="text-white bg-purple-600 hover:bg-purple-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              <strong>72-hour review process</strong> - You&apos;ll receive an email notification once approved
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VettedCreatorHighlight;
