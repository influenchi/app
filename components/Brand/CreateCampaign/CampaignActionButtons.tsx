
import { Button } from "@/components/ui/button";
import { CampaignData } from "./types";
import { StepValidation } from "./validation";
import { AlertCircle } from "lucide-react";

interface CampaignActionButtonsProps {
  currentStep: number;
  campaignData: CampaignData;
  isEditing: boolean;
  stepValidation: StepValidation;
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
  stepValidation,
  onClose,
  onBack,
  onNext,
  onSave,
  onCreate
}: CampaignActionButtonsProps) => {
  const isCurrentStepValid = stepValidation.isValid;
  const hasValidationErrors = stepValidation.errors.length > 0;

  return (
    <div className="space-y-4">
      {/* Validation Error Summary */}
      {hasValidationErrors && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Please complete the following required fields:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {stepValidation.errors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
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
              className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!isCurrentStepValid || campaignData.contentItems.length === 0}
            >
              {isEditing ? 'Update Campaign' : 'Publish Campaign'}
            </Button>
          </div>
        ) : (
          <Button
            onClick={onNext}
            className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!isCurrentStepValid}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default CampaignActionButtons;
