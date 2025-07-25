
import { Button } from "@/components/ui/button";
import { CampaignData } from "./types";

interface CampaignActionButtonsProps {
  currentStep: number;
  campaignData: CampaignData;
  isEditing: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  onCreate: () => void;
}

const CampaignActionButtons = ({
  currentStep,
  campaignData,
  isEditing,
  onClose,
  onBack,
  onNext,
  onSave,
  onCreate
}: CampaignActionButtonsProps) => {
  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={currentStep === 1 ? onClose : onBack}
      >
        {currentStep === 1 ? 'Cancel' : 'Back'}
      </Button>

      {currentStep === 4 ? (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onSave}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 hover:text-gray-900"
          >
            Save as Draft
          </Button>
          <Button
            onClick={onCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
            disabled={campaignData.contentItems.length === 0}
          >
            {isEditing ? 'Update Campaign' : 'Publish Campaign'}
          </Button>
        </div>
      ) : (
        <Button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
          disabled={currentStep === 2 && campaignData.contentItems.length === 0}
        >
          Next
        </Button>
      )}
    </div>
  );
};

export default CampaignActionButtons;
