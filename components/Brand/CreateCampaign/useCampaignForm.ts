/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampaignData } from "./types";
import { showConfetti } from "./confetti";
import { campaignSchema, CampaignFormData } from "@/lib/validations/brand";
import { useCreateCampaign, useSaveCampaignDraft, useUpdateCampaign } from "@/lib/hooks/useBrand";
import { getStepValidation, validateAllSteps, StepValidation } from "./validation";
import { toast } from "sonner";

interface UseCampaignFormProps {
  initialData?: Partial<CampaignData>;
  onSuccess: () => void;
  onClose?: () => void;
}

export const useCampaignForm = ({ initialData, onSuccess, onClose }: UseCampaignFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>((initialData as any)?.id || null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [stepValidation, setStepValidation] = useState<StepValidation>({ isValid: true, errors: [] });
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const saveDraft = useSaveCampaignDraft();

  const form = useForm<CampaignFormData & { image?: File; existingImageUrl?: string }>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: '',
      description: '',
      image: undefined,
      existingImageUrl: (initialData as any)?.existingImageUrl || undefined,
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

  // Track changes to detect if we need to save as draft and validate current step
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Check if form has meaningful data (not just default values)
      const hasData = value.title?.trim() ||
        value.description?.trim() ||
        (value.campaignGoal && value.campaignGoal.length > 0) ||
        (value.budget && value.budget !== '0' && value.budget.trim()) ||
        (value.contentItems && value.contentItems.length > 0);

      setHasUnsavedChanges(!!hasData);

      // Update current step validation
      // Coerce partial watch values to a complete CampaignData shape for validation
      const validationInput: CampaignData = {
        title: value.title || '',
        description: value.description || '',
        image: (value as any).image ?? undefined,
        campaignGoal: value.campaignGoal || [],
        budget: value.budget || '',
        budgetType: value.budgetType || ['paid'],
        productServiceDescription: value.productServiceDescription || '',
        creatorCount: value.creatorCount || '',
        startDate: value.startDate || '',
        completionDate: value.completionDate || '',
        contentItems: value.contentItems || [],
        targetAudience: value.targetAudience || {
          socialChannel: '',
          audienceSize: [],
          ageRange: [],
          gender: '',
          location: [],
          ethnicity: '',
          interests: []
        },
        requirements: value.requirements || '',
        creatorPurchaseRequired: value.creatorPurchaseRequired || false,
        productShipRequired: value.productShipRequired || false,
        affiliateProgram: value.affiliateProgram || undefined,
      };
      const validation = getStepValidation(currentStep, validationInput);
      setStepValidation(validation);
    });
    return () => subscription.unsubscribe();
  }, [form, currentStep]);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {

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
      // Validate current step before proceeding
      const validation = getStepValidation(currentStep, campaignData);
      if (!validation.isValid) {
        // Show validation errors
        validation.errors.forEach(error => {
          toast.error(error.message);
        });
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {

    const formData = form.getValues();
    saveDraft.mutate({ ...formData, id: draftId || undefined }, {
      onSuccess: (result) => {

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

      const formData = form.getValues();
      saveDraft.mutate({ ...formData, id: draftId || undefined }, {
        onSuccess: () => {

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

    // Final validation before submission
    const validation = validateAllSteps({
      title: formData.title || '',
      description: formData.description || '',
      image: (formData as any).image ?? undefined,
      campaignGoal: formData.campaignGoal || [],
      budget: formData.budget || '',
      budgetType: formData.budgetType || ['paid'],
      productServiceDescription: formData.productServiceDescription || '',
      creatorCount: formData.creatorCount || '',
      startDate: formData.startDate || '',
      completionDate: formData.completionDate || '',
      contentItems: formData.contentItems || [],
      targetAudience: formData.targetAudience || {
        socialChannel: '',
        audienceSize: [],
        ageRange: [],
        gender: '',
        location: [],
        ethnicity: '',
        interests: []
      },
      requirements: formData.requirements || '',
      creatorPurchaseRequired: formData.creatorPurchaseRequired || false,
      productShipRequired: formData.productShipRequired || false,
      affiliateProgram: formData.affiliateProgram || undefined,
    });
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        toast.error(error.message);
      });
      return;
    }

    // If editing an existing campaign, perform an update instead of create
    const existingId = (initialData as any)?.id || draftId;
    if (existingId) {
      updateCampaign.mutate(
        { id: existingId, ...(formData as any), status: 'active' },
        {
          onSuccess: () => {
            showConfetti();
            setTimeout(() => {
              onSuccess();
            }, 600);
          }
        }
      );
      return;
    }

    // New campaign
    createCampaign.mutate(formData, {
      onSuccess: () => {
        showConfetti();
        setTimeout(() => {
          onSuccess();
        }, 600);
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
    stepValidation,
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
