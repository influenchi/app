import { CampaignData } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface StepValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Step 1: Campaign Basics Validation
export const validateStep1 = (data: CampaignData): StepValidation => {
  const errors: ValidationError[] = [];

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Campaign title is required' });
  }

  if (!data.description?.trim()) {
    errors.push({ field: 'description', message: 'Campaign description is required' });
  } else if (data.description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  }

  if (!data.campaignGoal || data.campaignGoal.length === 0) {
    errors.push({ field: 'campaignGoal', message: 'Please select at least one campaign goal' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Step 2: Content Requirements Validation
export const validateStep2 = (data: CampaignData): StepValidation => {
  const errors: ValidationError[] = [];

  if (!data.contentItems || data.contentItems.length === 0) {
    errors.push({ field: 'contentItems', message: 'Please add at least one content requirement' });
  } else {
    // Validate each content item
    data.contentItems.forEach((item, index) => {
      if (!item.socialChannel) {
        errors.push({ field: `contentItems[${index}].socialChannel`, message: `Content item ${index + 1}: Social channel is required` });
      }
      const isOther = item.socialChannel === 'Other';
      if (!isOther && !item.contentType) {
        errors.push({ field: `contentItems[${index}].contentType`, message: `Content item ${index + 1}: Content type is required` });
      }
      if (isOther && !item.customTitle?.trim()) {
        errors.push({ field: `contentItems[${index}].customTitle`, message: `Content item ${index + 1}: Task title is required for Other` });
      }
      if (!item.quantity || item.quantity < 1) {
        errors.push({ field: `contentItems[${index}].quantity`, message: `Content item ${index + 1}: Quantity must be at least 1` });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Step 3: Budget & Timeline Validation
export const validateStep3 = (data: CampaignData): StepValidation => {
  const errors: ValidationError[] = [];

  if (!data.budgetType || data.budgetType.length === 0) {
    errors.push({ field: 'budgetType', message: 'Please select at least one budget type' });
  }

  if (!data.budget?.trim()) {
    errors.push({ field: 'budget', message: 'Budget amount is required' });
  } else if (data.budgetType.includes('paid') && (isNaN(Number(data.budget.replace(/[^0-9.]/g, ''))) || Number(data.budget.replace(/[^0-9.]/g, '')) <= 0)) {
    errors.push({ field: 'budget', message: 'Please enter a valid budget amount' });
  }

  if (data.budgetType.includes('gifted') && !data.productServiceDescription?.trim()) {
    errors.push({ field: 'productServiceDescription', message: 'Product description is required for gifted campaigns' });
  }



  if (!data.startDate?.trim()) {
    errors.push({ field: 'startDate', message: 'Start date is required' });
  }

  if (!data.completionDate?.trim()) {
    errors.push({ field: 'completionDate', message: 'Completion date is required' });
  }

  // Validate date logic
  if (data.startDate && data.completionDate) {
    const startDate = new Date(data.startDate);
    const completionDate = new Date(data.completionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      errors.push({ field: 'startDate', message: 'Start date cannot be in the past' });
    }

    if (completionDate <= startDate) {
      errors.push({ field: 'completionDate', message: 'Completion date must be after start date' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Step 4: Target Audience Validation
export const validateStep4 = (data: CampaignData): StepValidation => {
  const errors: ValidationError[] = [];

  // Creator count validation (this field is in Step 4)
  if (!data.creatorCount?.trim()) {
    errors.push({ field: 'creatorCount', message: 'Number of creators is required' });
  } else if (isNaN(Number(data.creatorCount)) || Number(data.creatorCount) < 1) {
    errors.push({ field: 'creatorCount', message: 'Please enter a valid number of creators (minimum 1)' });
  }

  // Check if Content Distribution goal requires additional validations
  const isDistributionGoal = data.campaignGoal?.includes('Content Distribution');

  if (isDistributionGoal) {
    if (!data.targetAudience?.socialChannel?.trim()) {
      errors.push({ field: 'targetAudience.socialChannel', message: 'Primary social channel is required for content distribution campaigns' });
    }

    if (!data.targetAudience?.audienceSize || data.targetAudience.audienceSize.length === 0) {
      errors.push({ field: 'targetAudience.audienceSize', message: 'Audience size is required for content distribution campaigns' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Final submission validation (all steps combined)
export const validateAllSteps = (data: CampaignData): StepValidation => {
  const step1 = validateStep1(data);
  const step2 = validateStep2(data);
  const step3 = validateStep3(data);
  const step4 = validateStep4(data);

  const allErrors = [
    ...step1.errors,
    ...step2.errors,
    ...step3.errors,
    ...step4.errors
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Get validation for specific step
export const getStepValidation = (step: number, data: CampaignData): StepValidation => {
  switch (step) {
    case 1:
      return validateStep1(data);
    case 2:
      return validateStep2(data);
    case 3:
      return validateStep3(data);
    case 4:
      return validateStep4(data);
    default:
      return { isValid: true, errors: [] };
  }
};