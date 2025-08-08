import { z } from "zod";

const displayNameRegex = /^[a-zA-Z0-9\s_-]+$/;

export const creatorOnboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string()
    .min(3, "Display name must be at least 3 characters")
    .max(30, "Display name must be less than 30 characters")
    .regex(displayNameRegex, "Display name can only contain letters, numbers, spaces, underscores, and hyphens")
    .transform(val => val.trim()),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must be less than 500 characters"),
  location: z.string().min(1, "Location is required"),
  profileImage: z.any().optional(),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  primaryNiche: z.string().min(1, "Primary niche is required"),
  secondaryNiches: z.array(z.string()).optional(),
  travelStyle: z.array(z.string()).min(1, "Please select at least one travel style"),
  contentTypes: z.array(z.string()).min(1, "Please select at least one content type"),
  totalFollowers: z.string().min(1, "Total followers is required"),
  primaryPlatform: z.string().min(1, "Primary platform is required"),
  audienceAge: z.array(z.string()).optional(),
  audienceGender: z.string().optional(),
  audienceLocation: z.array(z.string()).optional(),
  engagementRate: z.string().optional(),
  portfolioImages: z.array(z.any()).optional(),
  brandsWorkedWith: z
    .array(
      z.object({
        name: z.string().min(1, "Brand name is required"),
        url: z.string().url().optional().or(z.literal("")),
      })
    )
    .optional(),
});

export const creatorProfileUpdateSchema = z.object({
  displayName: z.string()
    .min(3, "Display name must be at least 3 characters")
    .max(30, "Display name must be less than 30 characters")
    .regex(displayNameRegex, "Display name can only contain letters, numbers, spaces, underscores, and hyphens")
    .transform(val => val.trim()),
  username: z.string().min(1, "Username is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio must be less than 500 characters"),
  location: z.string().min(1, "Location is required"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  categories: z.array(z.string()).optional(),
});

export const creatorApplicationSchema = z.object({
  message: z.string().min(10, "Application message must be at least 10 characters"),
  customQuote: z.string().optional(),
});

export type CreatorOnboardingFormData = z.infer<typeof creatorOnboardingSchema>;
export type CreatorProfileUpdateFormData = z.infer<typeof creatorProfileUpdateSchema>;
export type CreatorApplicationFormData = z.infer<typeof creatorApplicationSchema>; 