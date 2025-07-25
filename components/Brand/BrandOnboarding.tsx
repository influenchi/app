
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Plus, Image, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { brandOnboardingSchema, BrandOnboardingFormData } from "@/lib/validations/brand";
import { useBrandOnboarding } from "@/lib/hooks/useBrand";
import { useBrandOnboardingStore } from "@/lib/stores/brandOnboardingStore";
import { useSession } from "@/lib/hooks/useAuth";
import { validateImageFile, getFileTypeDisplay, getMaxFileSizeDisplay } from "@/lib/utils/storageUtils";

interface BrandOnboardingProps {
  onComplete: () => void;
}

const BrandOnboarding = ({ onComplete }: BrandOnboardingProps) => {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    formData,
    logoFile,
    logoPreview,
    currentStep,
    selectedIndustries,
    setFormData,
    setLogoFile,
    setLogoPreview,
    setCurrentStep,
    setSelectedIndustries,
    updateField,
    resetStore
  } = useBrandOnboardingStore();

  const form = useForm<BrandOnboardingFormData>({
    resolver: zodResolver(brandOnboardingSchema),
    defaultValues: formData
  });

  const brandOnboarding = useBrandOnboarding();

  useEffect(() => {
    if (session?.user && !formData.brandName) {
      const user = session.user as { companyName?: string };
      if (user.companyName) {
        const defaultFormData = {
          ...formData,
          brandName: user.companyName
        };
        setFormData(defaultFormData);
        form.reset(defaultFormData);
      }
    }
  }, [session, formData.brandName, setFormData, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormData(value as Partial<BrandOnboardingFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form, setFormData]);

  const industries = [
    'Travel & Tourism', 'Hospitality', 'Food & Beverage', 'Fashion & Beauty',
    'Technology', 'Health & Wellness', 'Automotive', 'Sports & Fitness',
    'Home & Garden', 'Entertainment', 'Education', 'Other'
  ];

  const handleNext = () => {
    if (currentStep < 3) {
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
    console.log('🔄 Preparing brand onboarding submission...');

    const formValues = form.getValues();

    // Prepare clean submission data
    const submissionData = {
      brandName: formValues.brandName || '',
      website: formValues.website || '',
      description: formValues.description || '',
      industries: selectedIndustries,
      socialMedia: {
        instagram: formValues.socialMedia?.instagram || '',
        tiktok: formValues.socialMedia?.tiktok || '',
        youtube: formValues.socialMedia?.youtube || '',
        website: formValues.socialMedia?.website || ''
      },
      logoFile: logoFile // File object - handled separately by the hook
    };

    console.log('📋 Submission data prepared:', {
      ...submissionData,
      logoFile: logoFile ? `File: ${logoFile.name}` : 'No file'
    });

    brandOnboarding.mutate(submissionData, {
      onSuccess: () => {
        console.log('✅ Brand onboarding successful, cleaning up...');
        resetStore();
        onComplete();
      },
      onError: (error) => {
        console.error('❌ Brand onboarding failed:', error);
      }
    });
  };

  const toggleIndustry = (industry: string) => {
    const newIndustries = selectedIndustries.includes(industry)
      ? selectedIndustries.filter(i => i !== industry)
      : [...selectedIndustries, industry];
    setSelectedIndustries(newIndustries);
  };

  const processFile = (file: File) => {
    // Clear previous errors
    setFileError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setFileError(validation.error || 'Invalid file');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const progressValue = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">
            Set up your Brand Profile
          </CardTitle>
          <p className="text-gray-600 mb-4">
            Step {currentStep} of 3 - Let&apos;s get your brand ready for campaigns
          </p>
          <Progress value={progressValue} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Basic Information</h3>

              <div>
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  {...form.register('brandName')}
                  placeholder="Enter your brand name"
                />
                {form.formState.errors.brandName && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.brandName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  {...form.register('website')}
                  placeholder="https://yourbrand.com"
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.website.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Brand Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Tell us about your brand, what you do, and what makes you unique..."
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Industry & Logo</h3>

              <div>
                <Label>Select Your Industries</Label>
                <p className="text-sm text-gray-600 mb-3">Choose all that apply to your brand</p>
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <Badge
                      key={industry}
                      variant={selectedIndustries.includes(industry) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => toggleIndustry(industry)}
                    >
                      {industry}
                      {selectedIndustries.includes(industry) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Brand Logo</Label>

                {/* File Requirements Alert */}
                <Alert className="mt-2 mb-4 border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Accepted formats:</strong> {getFileTypeDisplay()} • <strong>Max size:</strong> {getMaxFileSizeDisplay()}
                  </AlertDescription>
                </Alert>

                {/* File Error Alert */}
                {fileError && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {fileError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* File Upload Success Alert */}
                {logoFile && !fileError && (
                  <Alert className="mb-4 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      File &quot;{logoFile.name}&quot; selected successfully ({Math.round(logoFile.size / 1024)}KB)
                    </AlertDescription>
                  </Alert>
                )}

                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${fileError
                    ? 'border-red-300 bg-red-50 hover:border-red-400'
                    : logoFile
                      ? 'border-green-300 bg-green-50 hover:border-green-400'
                      : 'border-gray-300 hover:border-blue-400'
                    }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={handleChooseFile}
                >
                  {logoPreview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-24 w-24 object-contain mx-auto rounded-lg border"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute -top-2 -right-2 rounded-full h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLogo();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">{logoFile?.name}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((logoFile?.size || 0) / 1024)}KB • {logoFile?.type}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2 font-medium">Drop your logo here or click to upload</p>
                      <p className="text-sm text-gray-500 mb-1">
                        Supported: {getFileTypeDisplay()}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Maximum file size: {getMaxFileSizeDisplay()}
                      </p>
                      <Button variant="outline" className="mt-2">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Social Media Links</h3>
              <p className="text-gray-600">Connect your social media accounts (optional)</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    {...form.register('socialMedia.instagram')}
                    placeholder="@yourbrand or full URL"
                  />
                </div>

                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    {...form.register('socialMedia.tiktok')}
                    placeholder="@yourbrand or full URL"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    {...form.register('socialMedia.youtube')}
                    placeholder="Channel URL"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={brandOnboarding.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {brandOnboarding.isPending
                ? 'Saving...'
                : currentStep === 3
                  ? 'Complete Setup'
                  : 'Next'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandOnboarding;
