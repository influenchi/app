
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Upload } from "lucide-react";
import BasicInfoStep from "./Onboarding/BasicInfoStep";
import SocialProfilesStep from "./Onboarding/SocialProfilesStep";
import CreatorNicheStep from "./Onboarding/CreatorNicheStep";
import PortfolioStep from "./Onboarding/PortfolioStep";
import { CreatorProfileData } from "./types";
import { creatorOnboardingSchema, CreatorOnboardingFormData } from "@/lib/validations/creator";
import { useCreatorOnboarding } from "@/lib/hooks/useCreator";
import { useSession } from "@/lib/hooks/useAuth";
import { useDisplayNameCheck } from "@/lib/hooks/useDisplayNameCheck";
import { toast } from "sonner";

interface CreatorOnboardingProps {
  onComplete: () => void;
}

const CreatorOnboarding = ({ onComplete }: CreatorOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatorOnboardingFormData>({
    resolver: zodResolver(creatorOnboardingSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      bio: "",
      location: "",
      instagram: "",
      tiktok: "",
      youtube: "",
      twitter: "",
      website: "",
      primaryNiche: "",
      secondaryNiches: [],
      travelStyle: [],
      contentTypes: [],
      totalFollowers: "",
      primaryPlatform: "",
      audienceAge: [],
      audienceGender: "",
      audienceLocation: [],
      engagementRate: "",
      portfolioImages: []
    }
  });

  // Auto-fill form data from session when available
  useEffect(() => {
    if (session?.user) {
      // Auto-fill firstName if available from session
      if (session.user.first_name && !form.getValues('firstName')) {
        form.setValue('firstName', session.user.first_name, { shouldValidate: true });
      }

      // Auto-fill lastName if available from session
      if (session.user.last_name && !form.getValues('lastName')) {
        form.setValue('lastName', session.user.last_name, { shouldValidate: true });
      }

      // Auto-suggest displayName based on firstName and lastName (replace spaces with underscores)
      if (session.user.first_name && session.user.last_name && !form.getValues('displayName')) {
        const suggestedDisplayName = `${session.user.first_name} ${session.user.last_name}`
          .trim()
          .replace(/\s+/g, '_'); // Replace spaces with underscores for standard username formatting
        if (suggestedDisplayName) {
          form.setValue('displayName', suggestedDisplayName, { shouldValidate: true });
        }
      }
    }
  }, [session, form]);

  const creatorOnboarding = useCreatorOnboarding();

  // Watch form values to ensure reactivity
  const formValues = form.watch();

  // Portfolio images are now managed properly via the PortfolioStep component

  // Check display name availability only on step 1
  const displayNameCheck = useDisplayNameCheck(
    formValues.displayName,
    currentStep === 1
  );

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { number: 1, title: "Basic Information", component: BasicInfoStep },
    { number: 2, title: "Social Profiles", component: SocialProfilesStep },
    { number: 3, title: "Niche & Style", component: CreatorNicheStep },
    { number: 4, title: "Portfolio Showcase", component: PortfolioStep }
  ];

  const handleNext = async () => {
    // If on step 1, check if display name is available
    if (currentStep === 1) {
      // First validate the form fields for step 1
      const fieldsToValidate = ['firstName', 'lastName', 'displayName', 'bio', 'location'] as const;
      const isValid = await form.trigger(fieldsToValidate);

      if (!isValid) {
        toast.error('Please fill in all required fields correctly');
        return;
      }

      // Check if display name is available
      if (displayNameCheck.available === false) {
        toast.error('Please choose an available display name');
        return;
      }

      // If still checking, wait
      if (displayNameCheck.isChecking) {
        toast.info('Checking display name availability...');
        return;
      }
    }

    // Final step validation happens here

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const formData = form.getValues();

    // Check if there are files to upload
    const hasProfileImage = formData.profileImage instanceof File;
    const hasPortfolioFiles = formData.portfolioImages?.some(img => img instanceof File);



    if (hasProfileImage || hasPortfolioFiles) {
      setIsSubmitting(true);
    }

    creatorOnboarding.mutate(formData, {
      onSuccess: () => {
        setIsSubmitting(false);
        // Small delay to ensure session is refreshed before navigation
        setTimeout(() => {
          onComplete();
        }, 500);
      },
      onError: () => {
        setIsSubmitting(false);
      }
    });
  };

  const updateProfileData = useCallback((field: string, value: unknown) => {
    form.setValue(field as keyof CreatorOnboardingFormData, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  }, [form]);

  const CurrentStepComponent = steps[currentStep - 1].component;

  // Determine if next button should be disabled
  const isNextDisabled = () => {
    if (creatorOnboarding.isPending || isSubmitting) return true;

    if (currentStep === 1) {
      return displayNameCheck.isChecking || displayNameCheck.available === false;
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Creator Profile
          </h1>
          <p className="text-lg text-gray-600">
            Let&apos;s create your profile to connect with amazing brands
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step.number
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                  }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`mt-2 text-sm ${currentStep >= step.number ? 'text-orange-600 font-medium' : 'text-gray-500'
                  }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600 mt-2 text-center">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg relative">
          {/* Loading Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <Upload className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-bounce" />
                <Loader2 className="h-8 w-8 text-orange-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Creating Your Profile...
                </h3>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">
                  We&apos;re uploading your images and setting up your creator profile. This may take a moment.
                </p>
              </div>
            </div>
          )}

          <CardHeader>
            <CardTitle className="text-xl">
              {steps[currentStep - 1].title}
            </CardTitle>
            {currentStep === 1 && session?.user && (
              <p className="text-sm text-gray-500 mt-2">
                We&apos;ve pre-filled some information from your signup. Feel free to edit as needed.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <CurrentStepComponent
              profileData={{ ...formValues, profileImage: formValues.profileImage || null } as CreatorProfileData}
              onUpdateData={updateProfileData}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              >
                {creatorOnboarding.isPending || isSubmitting
                  ? 'Saving...'
                  : displayNameCheck.isChecking && currentStep === 1
                    ? 'Checking...'
                    : currentStep === totalSteps
                      ? 'Complete Profile'
                      : 'Next'
                }
                {currentStep < totalSteps && !creatorOnboarding.isPending && !displayNameCheck.isChecking && !isSubmitting && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatorOnboarding;
