/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampaignData } from "./types";
import { showConfetti } from "./confetti";
import { campaignSchema, CampaignFormData } from "@/lib/validations/brand";
import { useCreateCampaign, useSaveCampaignDraft } from "@/lib/hooks/useBrand";

interface UseCampaignFormProps {
  initialData?: Partial<CampaignData>;
  onSuccess: () => void;
  onClose?: () => void;
}

export const useCampaignForm = ({ initialData, onSuccess, onClose }: UseCampaignFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>((initialData as any)?.id || null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const createCampaign = useCreateCampaign();
  const saveDraft = useSaveCampaignDraft();

  const form = useForm<CampaignFormData & { image?: File }>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: '',
      description: '',
      image: undefined,
      campaignGoal: [],
      budget: '',
      budgetType: ['paid'],
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

  // Track changes to detect if we need to save as draft
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Check if form has meaningful data (not just default values)
      const hasData = value.title?.trim() ||
        value.description?.trim() ||
        (value.campaignGoal && value.campaignGoal.length > 0) ||
        (value.budget && value.budget !== '0' && value.budget.trim()) ||
        (value.contentItems && value.contentItems.length > 0);

      setHasUnsavedChanges(!!hasData);
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
        budgetType: Array.isArray(initialData.budgetType)
          ? initialData.budgetType
          : initialData.budgetType ? [initialData.budgetType] : ['paid'],
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
    const formData = form.getValues();
    saveDraft.mutate({ ...formData, id: draftId || undefined }, {
      onSuccess: (result) => {
        console.log('Draft saved successfully:', result);
        if (result.campaign?.id && !draftId) {
          setDraftId(result.campaign.id);
        }
        setHasUnsavedChanges(false);
        onSuccess();
      }
    });
  };

  const handleClose = () => {
    // Auto-save as draft if there are unsaved changes
    if (hasUnsavedChanges && !createCampaign.isPending) {
      console.log('Auto-saving draft before close...');
      const formData = form.getValues();
      saveDraft.mutate({ ...formData, id: draftId || undefined }, {
        onSuccess: () => {
          console.log('Auto-draft saved successfully');
          if (onClose) onClose();
        },
        onError: () => {
          // Even if auto-save fails, allow closing
          if (onClose) onClose();
        }
      });
    } else {
      if (onClose) onClose();
    }
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
    const currentTypes = form.getValues('budgetType');
    const newTypes = currentTypes.includes(budgetType)
      ? currentTypes.filter(t => t !== budgetType)
      : [...currentTypes, budgetType];
    form.setValue('budgetType', newTypes);
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
    isLoading: createCampaign.isPending || saveDraft.isPending,
    hasUnsavedChanges,
    draftId,
    handleNext,
    handleBack,
    handleSave,
    handleCreate,
    handleClose,
    handleUpdate,
    handleUpdateBudgetType,
    handleUpdateTargetAudience,
    toggleInterest,
    toggleCampaignGoal
  };
};
