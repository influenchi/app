import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BrandOnboardingFormData } from '@/lib/validations/brand';

export interface BrandOnboardingState {
  formData: Partial<BrandOnboardingFormData>;
  logoFile: File | null;
  logoPreview: string | null;
  currentStep: number;
  selectedIndustries: string[];

  setFormData: (data: Partial<BrandOnboardingFormData>) => void;
  setLogoFile: (file: File | null) => void;
  setLogoPreview: (preview: string | null) => void;
  setCurrentStep: (step: number) => void;
  setSelectedIndustries: (industries: string[]) => void;

  updateField: (field: keyof BrandOnboardingFormData, value: unknown) => void;
  resetStore: () => void;
}

const initialState = {
  formData: {
    brandName: '',
    website: '',
    description: '',
    industries: [],
    socialMedia: {
      instagram: '',
      tiktok: '',
      youtube: '',
      website: ''
    }
  },
  logoFile: null,
  logoPreview: null,
  currentStep: 1,
  selectedIndustries: [],
};

export const useBrandOnboardingStore = create<BrandOnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),

      setLogoFile: (file) => set({ logoFile: file }),

      setLogoPreview: (preview) => set({ logoPreview: preview }),

      setCurrentStep: (step) => set({ currentStep: step }),

      setSelectedIndustries: (industries) => set({ selectedIndustries: industries }),

      updateField: (field, value) => set((state) => ({
        formData: { ...state.formData, [field]: value }
      })),

      resetStore: () => set(initialState),
    }),
    {
      name: 'brand-onboarding-storage',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        selectedIndustries: state.selectedIndustries,
      }),
    }
  )
); 