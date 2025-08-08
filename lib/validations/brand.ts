import { z } from "zod";

export const brandOnboardingSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().min(10, "Description must be at least 10 characters"),
  industries: z.array(z.string()).min(1, "Please select at least one industry"),
  logo: z.any().optional(),
  socialMedia: z.object({
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    website: z.string().optional(),
  }),
});

export const brandProfileUpdateSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  brandName: z.string().min(1, "Brand name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
});

export const campaignSchema = z.object({
  title: z.string().min(1, "Campaign title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.any().refine((file) => file !== null && file !== undefined, {
    message: "Campaign image is required",
  }),
  campaignGoal: z.array(z.string()).min(1, "Please select at least one campaign goal"),
  budget: z.string().min(1, "Budget is required"),
  budgetType: z.array(z.enum(["paid", "gifted", "affiliate"])).min(1, "Please select at least one budget type"),
  productServiceDescription: z.string().optional(),
  creatorCount: z.string().min(1, "Number of creators is required"),
  startDate: z.string().min(1, "Start date is required"),
  completionDate: z.string().min(1, "Completion date is required"),
  contentItems: z.array(z.object({
    id: z.string(),
    socialChannel: z.string().min(1, "Social channel is required"),
    contentType: z.string().optional(),
    quantity: z.number().min(1),
    description: z.string().optional(),
    customTitle: z.string().optional(),
  })).superRefine((items, ctx) => {
    items.forEach((item, index) => {
      const isOther = item.socialChannel === 'Other';
      if (!isOther && (!item.contentType || item.contentType.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Content item ${index + 1}: Content type is required`,
          path: [index, 'contentType']
        });
      }
      if (isOther && (!item.customTitle || item.customTitle.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Content item ${index + 1}: Task title is required for Other`,
          path: [index, 'customTitle']
        });
      }
    });
  }),
  targetAudience: z.object({
    socialChannel: z.string().optional(),
    audienceSize: z.array(z.string()),
    ageRange: z.array(z.string()),
    gender: z.string().optional(),
    location: z.array(z.string()),
    ethnicity: z.string().optional(),
    interests: z.array(z.string()),
  }),
  requirements: z.string().optional(),
  creatorPurchaseRequired: z.boolean().optional(),
  productShipRequired: z.boolean().optional(),
  affiliateProgram: z.string().optional(),
});

export type BrandOnboardingFormData = z.infer<typeof brandOnboardingSchema>;
export type BrandProfileUpdateFormData = z.infer<typeof brandProfileUpdateSchema>;
export type CampaignFormData = z.infer<typeof campaignSchema>; 