
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampaignData } from "./types";
import { showConfetti } from "./confetti";
import { campaignSchema, CampaignFormData } from "@/lib/validations/brand";
import { useCreateCampaign } from "@/lib/hooks/useBrand";

interface UseCampaignFormProps {
  initialData?: Partial<CampaignData>;
  onSuccess: () => void;
}

export const useCampaignForm = ({ initialData, onSuccess }: UseCampaignFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const createCampaign = useCreateCampaign();

  const form = useForm<CampaignFormData & { image?: File }>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: '',
      description: '',
      image: undefined,
      campaignGoal: [],
      budget: '',
      budgetType: 'paid',
      productServiceDescription: '',
      creatorCount: '',
      startDate: '',
      completionDate: '',
      contentItems: [],
      targetAudience: {
        socialChannel: '',
        audienceSize: [],
        ageRange: [],
        gender: '',
        location: [],
        ethnicity: '',
        interests: []
      },
      requirements: '',
      creatorPurchaseRequired: false,
      productShipRequired: false
    }
  });

  const campaignData = form.watch();

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      console.log('Loading initial data for editing:', initialData);
      form.reset({
        title: initialData.title || '',
        description: initialData.description || '',
        image: initialData.image || undefined,
        campaignGoal: initialData.campaignGoal || [],
        budget: initialData.budget?.replace('$', '') || '',
        budgetType: initialData.budgetType || 'paid',
        productServiceDescription: initialData.productServiceDescription || '',
        creatorCount: initialData.creatorCount || '',
        startDate: initialData.startDate || '',
        completionDate: initialData.completionDate || '',
        contentItems: initialData.contentItems || [],
        targetAudience: {
          socialChannel: initialData.targetAudience?.socialChannel || '',
          audienceSize: Array.isArray(initialData.targetAudience?.audienceSize)
            ? initialData.targetAudience.audienceSize
            : initialData.targetAudience?.audienceSize ? [initialData.targetAudience.audienceSize] : [],
          ageRange: Array.isArray(initialData.targetAudience?.ageRange)
            ? initialData.targetAudience.ageRange
            : initialData.targetAudience?.ageRange ? [initialData.targetAudience.ageRange] : [],
          gender: initialData.targetAudience?.gender || '',
          location: Array.isArray(initialData.targetAudience?.location)
            ? initialData.targetAudience.location
            : initialData.targetAudience?.location ? [initialData.targetAudience.location] : [],
          ethnicity: initialData.targetAudience?.ethnicity || '',
          interests: initialData.targetAudience?.interests || []
        },
        requirements: initialData.requirements || '',
        creatorPurchaseRequired: initialData.creatorPurchaseRequired || false,
        productShipRequired: initialData.productShipRequired || false
      });
    }
  }, [initialData, form]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    console.log('Saving campaign as draft:', campaignData);
    onSuccess();
  };

  const handleCreate = () => {
    const formData = form.getValues();
    createCampaign.mutate(formData, {
      onSuccess: () => {
        showConfetti();
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    });
  };

  const handleUpdate = (field: string, value: unknown) => {
    form.setValue(field as keyof (CampaignFormData & { image?: File }), value as never);
  };

  const handleUpdateBudgetType = (budgetType: 'paid' | 'gifted' | 'affiliate') => {
    form.setValue('budgetType', budgetType);
  };

  const handleUpdateTargetAudience = (field: string, value: string | string[]) => {
    form.setValue(`targetAudience.${field}` as keyof (CampaignFormData & { image?: File }), value);
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = form.getValues('targetAudience.interests');
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    form.setValue('targetAudience.interests', newInterests);
  };

  const toggleCampaignGoal = (goal: string) => {
    const currentGoals = form.getValues('campaignGoal');
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    form.setValue('campaignGoal', newGoals);
  };

  return {
    currentStep,
    campaignData,
    form,
    isLoading: createCampaign.isPending,
    handleNext,
    handleBack,
    handleSave,
    handleCreate,
    handleUpdate,
    handleUpdateBudgetType,
    handleUpdateTargetAudience,
    toggleInterest,
    toggleCampaignGoal
  };
};
