
interface CampaignStepNavigationProps {
  currentStep: number;
  isEditing: boolean;
}

const CampaignStepNavigation = ({ currentStep, isEditing }: CampaignStepNavigationProps) => {
  const steps = [
    { number: 1, title: 'Campaign Basics' },
    { number: 2, title: 'Content Requirements' },
    { number: 3, title: 'Budget & Timeline' },
    { number: 4, title: 'Target Audience' }
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= step.number 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step.number}
            </div>
            <span className={`ml-2 text-sm ${
              currentStep >= step.number ? 'text-blue-600 font-medium' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`mx-4 h-px w-12 ${
                currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Step {currentStep} of 4 - {isEditing ? 'Update your campaign details' : "Let's create your campaign"}
      </p>
    </div>
  );
};

export default CampaignStepNavigation;
