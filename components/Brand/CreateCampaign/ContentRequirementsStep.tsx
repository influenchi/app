
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { CampaignData, ContentItem } from "./types";
import { socialChannels, contentTypesBySocial } from "./constants";

interface ContentRequirementsStepProps {
  campaignData: CampaignData;
  onUpdate: (field: string, value: ContentItem[]) => void;
}

const ContentRequirementsStep = ({ campaignData, onUpdate }: ContentRequirementsStepProps) => {
  const addContentItem = () => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      socialChannel: '',
      contentType: '',
      quantity: 1,
      description: '',
      customTitle: ''
    };
    onUpdate('contentItems', [...campaignData.contentItems, newItem]);
  };

  const updateContentItem = (id: string, field: keyof ContentItem, value: string | number) => {
    const updatedItems = campaignData.contentItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onUpdate('contentItems', updatedItems);
  };

  const removeContentItem = (id: string) => {
    const filteredItems = campaignData.contentItems.filter(item => item.id !== id);
    onUpdate('contentItems', filteredItems);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tasks / Requirements</h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Tasks</Label>
          <Button onClick={addContentItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>

        {campaignData.contentItems.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-3 gap-3 flex-1">
                <div>
                  <Label>Social Channel</Label>
                  <Select
                    value={item.socialChannel}
                    onValueChange={(value) => updateContentItem(item.id, 'socialChannel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {socialChannels.map((channel) => (
                        <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {item.socialChannel === 'Other' ? (
                  <div>
                    <Label>Task Title</Label>
                    <Input
                      value={item.customTitle || ''}
                      onChange={(e) => updateContentItem(item.id, 'customTitle', e.target.value)}
                      placeholder="Enter task title"
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Content Type</Label>
                    <Select
                      value={item.contentType}
                      onValueChange={(value) => updateContentItem(item.id, 'contentType', value)}
                      disabled={!item.socialChannel || item.socialChannel === 'Other'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {item.socialChannel && item.socialChannel !== 'Other' && contentTypesBySocial[item.socialChannel as keyof typeof contentTypesBySocial]?.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateContentItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <Button
                onClick={() => removeContentItem(item.id)}
                size="sm"
                variant="ghost"
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label>Description & Requirements</Label>
              <Textarea
                value={item.description}
                onChange={(e) => updateContentItem(item.id, 'description', e.target.value)}
                placeholder="Describe specific requirements for this content..."
                rows={2}
              />
            </div>
          </div>
        ))}

        {campaignData.contentItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">Add tasks to specify what you need</div>
        )}
      </div>
    </div>
  );
};

export default ContentRequirementsStep;
