
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import CampaignBasicsStep from "./CreateCampaign/CampaignBasicsStep";
import ContentRequirementsStep from "./CreateCampaign/ContentRequirementsStep";
import BudgetTimelineStep from "./CreateCampaign/BudgetTimelineStep";
import TargetAudienceStep from "./CreateCampaign/TargetAudienceStep";
import CampaignStepNavigation from "./CreateCampaign/CampaignStepNavigation";
import CampaignActionButtons from "./CreateCampaign/CampaignActionButtons";
import { useCampaignForm } from "./CreateCampaign/useCampaignForm";

interface CreateCampaignModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const CreateCampaignModal = ({ onClose, onSuccess, initialData }: CreateCampaignModalProps) => {
  const {
    currentStep,
    campaignData,
    handleNext,
    handleBack,
    handleSave,
    handleCreate,
    handleUpdate,
    handleUpdateBudgetType,
    handleUpdateTargetAudience,
    toggleInterest,
    toggleCampaignGoal
  } = useCampaignForm({ initialData, onSuccess });

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CampaignBasicsStep
            campaignData={campaignData}
            onUpdate={handleUpdate}
            onToggleCampaignGoal={toggleCampaignGoal}
          />
        );
      case 2:
        return <ContentRequirementsStep campaignData={campaignData} onUpdate={handleUpdate} />;
      case 3:
        return (
          <BudgetTimelineStep
            campaignData={campaignData}
            onUpdate={handleUpdate}
            onUpdateBudgetType={handleUpdateBudgetType}
          />
        );
      case 4:
        return (
          <TargetAudienceStep
            campaignData={campaignData}
            onUpdateTargetAudience={handleUpdateTargetAudience}
            onToggleInterest={toggleInterest}
            onUpdate={handleUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {initialData ? 'Edit Campaign' : 'Create New Campaign'}
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              <CampaignStepNavigation
                currentStep={currentStep}
                isEditing={!!initialData}
              />
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {renderCurrentStep()}

          <CampaignActionButtons
            currentStep={currentStep}
            campaignData={campaignData}
            isEditing={!!initialData}
            onClose={onClose}
            onBack={handleBack}
            onNext={handleNext}
            onSave={handleSave}
            onCreate={handleCreate}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCampaignModal;
