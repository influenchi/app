
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Sparkles, Loader } from "lucide-react";
import { CampaignData } from "./types";

interface CampaignBasicsStepProps {
  campaignData: CampaignData;
  onUpdate: (field: string, value: string | File) => void;
  onToggleCampaignGoal: (goal: string) => void;
}

const CampaignBasicsStep = ({ campaignData, onUpdate, onToggleCampaignGoal }: CampaignBasicsStepProps) => {
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const campaignGoalOptions = ['Content Creation', 'Distribution'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate('image', file);
    }
  };

  const generateAIDescription = async () => {
    if (!campaignData.title.trim()) {
      alert('Please enter a campaign title first to generate AI description');
      return;
    }

    setIsGeneratingDescription(true);
    
    // Simulate AI generation - in a real app, this would call an AI API
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const aiDescription = `Create engaging content showcasing ${campaignData.title}. We're looking for authentic storytelling that resonates with your audience while highlighting the key features and benefits. Please ensure your content aligns with our brand values and maintains a professional yet approachable tone. Include clear calls-to-action and use relevant hashtags to maximize reach and engagement.`;
      onUpdate('description', aiDescription);
    } catch (error) {
      console.error('Error generating AI description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Camera className="h-5 w-5 mr-2" />
        Campaign Basics
      </h3>
      
      <div>
        <Label htmlFor="title">Campaign Title</Label>
        <Input
          id="title"
          value={campaignData.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="e.g., Luxury Beach Resort Content"
          required
        />
      </div>

      <div>
        <Label>Campaign Goal</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {campaignGoalOptions.map((goal) => (
            <Badge
              key={goal}
              variant={campaignData.campaignGoal.includes(goal) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onToggleCampaignGoal(goal)}
            >
              {goal}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="description">Campaign Description</Label>
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
        />
      </div>

      <div>
        <Label htmlFor="image">Campaign Image</Label>
        <div className="mt-2">
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              {campaignData.image ? (
                <div>
                  <img 
                    src={URL.createObjectURL(campaignData.image)} 
                    alt="Campaign preview" 
                    className="max-h-32 mx-auto rounded mb-2"
                  />
                  <p className="text-sm text-gray-600">{campaignData.image.name}</p>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Click to upload campaign image</p>
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
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignBasicsStep;
