
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Sparkles, Loader, X, Check } from "lucide-react";
import { CampaignData } from "./types";
import { validateImageFile, getFileTypeDisplay, getMaxFileSizeDisplay } from "@/lib/utils/storageUtils";
import { toast } from "sonner";

interface CampaignBasicsStepProps {
  campaignData: CampaignData;
  onUpdate: (field: string, value: string | File) => void;
  onToggleCampaignGoal: (goal: string) => void;
}

const CampaignBasicsStep = ({ campaignData, onUpdate, onToggleCampaignGoal }: CampaignBasicsStepProps) => {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [imageUploadState, setImageUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const campaignGoalOptions = [
    'Brand Awareness',
    'Content Creation',
    'Product Launch',
    'User Generated Content',
    'Event Promotion',
    'Seasonal Campaign'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadState('uploading');

    // Validate the file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      setImageUploadState('error');
      return;
    }

    // File is valid, update the form data
    onUpdate('image', file);
    setImageUploadState('success');
    toast.success('Image uploaded successfully!');
  };

  const removeImage = () => {
    onUpdate('image', null as unknown as File);
    setImageUploadState('idle');
  };

  const generateAIDescription = async () => {
    if (!campaignData.title.trim()) {
      toast.error('Please enter a campaign title first to generate AI description');
      return;
    }

    setIsGeneratingDescription(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const aiDescription = `Create engaging content showcasing ${campaignData.title}. We're looking for authentic storytelling that resonates with your audience while highlighting the key features and benefits. Please ensure your content aligns with our brand values and maintains a professional yet approachable tone. Include clear calls-to-action and use relevant hashtags to maximize reach and engagement.`;
      onUpdate('description', aiDescription);
      toast.success('AI description generated!');
    } catch (error) {
      console.error('Error generating AI description:', error);
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const getImageUploadIcon = () => {
    switch (imageUploadState) {
      case 'uploading':
        return <Loader className="h-8 w-8 mx-auto text-blue-600 animate-spin mb-2" />;
      case 'success':
        return <Check className="h-8 w-8 mx-auto text-green-600 mb-2" />;
      case 'error':
        return <Upload className="h-8 w-8 mx-auto text-red-600 mb-2" />;
      default:
        return <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />;
    }
  };

  const getImageUploadText = () => {
    switch (imageUploadState) {
      case 'uploading':
        return 'Uploading image...';
      case 'success':
        return 'Image uploaded successfully!';
      case 'error':
        return 'Upload failed. Try again.';
      default:
        return 'Click to upload campaign image';
    }
  };

  const getImageUploadBorderColor = () => {
    switch (imageUploadState) {
      case 'uploading':
        return 'border-blue-400';
      case 'success':
        return 'border-green-400';
      case 'error':
        return 'border-red-400';
      default:
        return 'border-gray-300 hover:border-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center">
        <Camera className="h-5 w-5 mr-2" />
        Campaign Basics
      </h3>

      <div>
        <Label htmlFor="title">Campaign Title *</Label>
        <Input
          id="title"
          value={campaignData.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="e.g., Luxury Beach Resort Content"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>Campaign Goals *</Label>
        <p className="text-sm text-muted-foreground mb-3">Select all that apply to your campaign</p>
        <div className="flex flex-wrap gap-2">
          {campaignGoalOptions.map((goal) => (
            <Badge
              key={goal}
              variant={campaignData.campaignGoal.includes(goal) ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => onToggleCampaignGoal(goal)}
            >
              {campaignData.campaignGoal.includes(goal) && (
                <Check className="h-3 w-3 mr-1" />
              )}
              {goal}
            </Badge>
          ))}
        </div>
        {campaignData.campaignGoal.length > 0 && (
          <p className="text-sm text-green-600 mt-2">
            {campaignData.campaignGoal.length} goal{campaignData.campaignGoal.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="description">Campaign Description *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateAIDescription}
            disabled={isGeneratingDescription || !campaignData.title.trim()}
            className="text-xs"
          >
            {isGeneratingDescription ? (
              <Loader className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            {isGeneratingDescription ? 'Generating...' : 'Use AI'}
          </Button>
        </div>
        <Textarea
          id="description"
          value={campaignData.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Describe what you're looking for, your brand, and campaign goals..."
          rows={4}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="image">Campaign Image</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Upload a high-quality image that represents your campaign. Max {getMaxFileSizeDisplay()}, {getFileTypeDisplay()} formats supported.
        </p>
        <div className="mt-2">
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${getImageUploadBorderColor()}`}>
              {campaignData.image ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(campaignData.image)}
                    alt="Campaign preview"
                    className="max-h-32 mx-auto rounded mb-2"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <p className="text-sm text-green-600 font-medium">{campaignData.image.name}</p>
                  <p className="text-xs text-muted-foreground">Click to change image</p>
                </div>
              ) : (
                <div>
                  {getImageUploadIcon()}
                  <p className="text-gray-600 font-medium">{getImageUploadText()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 1200x600px or higher
                  </p>
                </div>
              )}
            </div>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={imageUploadState === 'uploading'}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignBasicsStep;
