import { useRef, useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Upload, Loader2, CheckCircle, AlertTriangle, Video, Building2 } from "lucide-react";
import { CreatorProfileData } from "../types";
import { validateMediaFile, getFileTypeDisplay, getVideoTypeDisplay, getMaxFileSizeDisplay } from "@/lib/utils/storageUtils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PortfolioStepProps {
  profileData: CreatorProfileData;
  onUpdateData: (field: string, value: unknown) => void;
}

interface PortfolioImage {
  file?: File;
  url?: string;
  preview: string;
  mediaType?: 'image' | 'video';
  isUploading?: boolean;
  error?: string;
}

interface BrandWorkedWith {
  id: string;
  name: string;
  url?: string;
  logo?: string;
  logoFile?: File;
  logoPreview?: string;
  isUploading?: boolean;
  error?: string;
}

function guessMediaTypeFromUrl(url: string): 'image' | 'video' {
  const lower = url.toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')) return 'video';
  return 'image';
}

const PortfolioStep = ({ profileData, onUpdateData }: PortfolioStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const brandLogoInputRef = useRef<HTMLInputElement>(null);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [brandsWorkedWith, setBrandsWorkedWith] = useState<BrandWorkedWith[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized && profileData.portfolioImages && profileData.portfolioImages.length > 0) {
      const images: PortfolioImage[] = profileData.portfolioImages.map((item) => {
        if (typeof item === 'string') {
          const mediaType = guessMediaTypeFromUrl(item);
          return { url: item, preview: item, mediaType };
        } else if (item instanceof File) {
          const mediaType: 'image' | 'video' = item.type.startsWith('video/') ? 'video' : 'image';
          return { file: item, preview: URL.createObjectURL(item), mediaType };
        }
        return { preview: '', mediaType: 'image' as const };
      }).filter(img => img.preview);

      setPortfolioImages(images);
      setHasInitialized(true);
    }
  }, [profileData.portfolioImages, hasInitialized]);

  useEffect(() => {
    // Initialize brands from profile data
    if (profileData.brandsWorkedWith && profileData.brandsWorkedWith.length > 0) {
      const brands: BrandWorkedWith[] = profileData.brandsWorkedWith.map((brand, index) => ({
        id: `brand-${index}`,
        name: brand.name,
        url: brand.url || '',
        logo: brand.logo || '',
      }));
      setBrandsWorkedWith(brands);
    }
  }, [profileData.brandsWorkedWith]);



  useEffect(() => {
    // Always sync URLs back to the parent form whenever local state changes
    const urls = portfolioImages.map(img => img.url).filter(Boolean);
    onUpdateData('portfolioImages', urls);
  }, [portfolioImages, onUpdateData]);

  // Helper function to sync brands to parent (deferred to avoid setState during render)
  const syncBrands = useCallback((brands: BrandWorkedWith[]) => {
    setTimeout(() => {
      const brandsData = brands.map(brand => ({
        name: brand.name,
        url: brand.url,
        logo: brand.logo,
      }));
      onUpdateData('brandsWorkedWith', brandsData);
    }, 0);
  }, [onUpdateData]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const files = event.target.files;

    if (!files || files.length === 0) {

      return;
    }

    setIsProcessing(true);
    const remainingSlots = 5 - portfolioImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const validFiles: File[] = [];
    const tempImages: PortfolioImage[] = [];

    // Validate files and create temporary previews
    for (const file of filesToProcess) {
      const validation = validateMediaFile(file);
      if (!validation.isValid) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }

      const mediaType: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
      const preview = URL.createObjectURL(file);
      tempImages.push({ file, preview, mediaType, isUploading: true });
      validFiles.push(file);
    }

    if (tempImages.length === 0) {
      setIsProcessing(false);
      return;
    }

    // Add images with uploading state
    setPortfolioImages(prev => [...prev, ...tempImages]);

    try {
      // Upload each file individually so each item gets its URL asap

      const startingIndex = portfolioImages.length;

      const uploadSingleFile = async (file: File, targetIndex: number) => {
        try {
          const formData = new FormData();
          formData.append('files', file);

          const response = await fetch('/api/upload/portfolio-images', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          });

          if (!response.ok) {
            const errorResp = await response.json();
            throw new Error(errorResp.error || 'Upload failed');
          }

          const result: { urls?: string[]; errors?: string[] } = await response.json();
          const url = Array.isArray(result.urls) && result.urls.length > 0 ? result.urls[0] : undefined;
          const err = Array.isArray(result.errors) && result.errors.length > 0 ? result.errors[0] : undefined;

          if (url) {
            setPortfolioImages(prev => {
              const updated = [...prev];
              if (updated[targetIndex]) {
                // Clean up blob URL since we now have the real URL
                if (updated[targetIndex].file && updated[targetIndex].preview.startsWith('blob:')) {
                  URL.revokeObjectURL(updated[targetIndex].preview);
                }
                // Use the uploaded URL as both the url and the preview
                updated[targetIndex] = {
                  ...updated[targetIndex],
                  url,
                  preview: url, // Use uploaded URL as preview
                  isUploading: false,
                  error: undefined
                };
              }
              return updated;
            });

            toast.success(`${file.name} uploaded`);
          } else {
            setPortfolioImages(prev => {
              const updated = [...prev];
              if (updated[targetIndex]) {
                updated[targetIndex] = { ...updated[targetIndex], isUploading: false, error: err || 'Upload failed' };
              }
              return updated;
            });

            toast.error(`${file.name}: ${err || 'Upload failed'}`);
          }
        } catch (singleErr) {
          console.error('📁 PortfolioStep: Single file upload error for', file.name, singleErr);
          setPortfolioImages(prev => {
            const updated = [...prev];
            if (updated[targetIndex]) {
              updated[targetIndex] = { ...updated[targetIndex], isUploading: false, error: 'Upload failed' };
            }
            return updated;
          });
          toast.error(`${file.name}: Upload failed`);
        }
      };

      // Sequential uploads to keep network stable and UI predictable
      for (let i = 0; i < validFiles.length; i++) {
        await uploadSingleFile(validFiles[i], startingIndex + i);
      }

    } catch (error) {
      console.error('Portfolio upload error (batch):', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload media items');
    }

    setIsProcessing(false);

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setPortfolioImages(prev => {
      const newImages = [...prev];
      const imageToRemove = newImages[index];

      // Clean up blob URL if it was created locally (not an uploaded URL)
      if (imageToRemove.file && imageToRemove.preview && imageToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      newImages.splice(index, 1);
      return newImages;
    });
    toast.info('Item removed');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;

    if (files.length > 0) {
      const syntheticEvent = {
        target: { files },
        currentTarget: { files }
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      handleImageUpload(syntheticEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const triggerFileInput = () => { fileInputRef.current?.click(); };
  const triggerVideoInput = () => { videoInputRef.current?.click(); };

  // Brand management functions
  const addBrand = () => {
    const newBrand: BrandWorkedWith = {
      id: `brand-${Date.now()}`,
      name: '',
      url: '',
    };
    setBrandsWorkedWith(prev => {
      const updated = [...prev, newBrand];
      syncBrands(updated);
      return updated;
    });
  };

  const removeBrand = (id: string) => {
    setBrandsWorkedWith(prev => {
      const brandToRemove = prev.find(brand => brand.id === id);
      if (brandToRemove?.logoPreview && brandToRemove.logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(brandToRemove.logoPreview);
      }
      const updated = prev.filter(brand => brand.id !== id);
      syncBrands(updated);
      return updated;
    });
    toast.info('Brand removed');
  };

  const updateBrand = useCallback((id: string, field: keyof BrandWorkedWith, value: string) => {
    setBrandsWorkedWith(prev => {
      const updated = prev.map(brand =>
        brand.id === id ? { ...brand, [field]: value } : brand
      );
      syncBrands(updated);
      return updated;
    });
  }, [syncBrands]);

  const handleBrandLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, brandId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateMediaFile(file);
    if (!validation.isValid) {
      toast.error(`${file.name}: ${validation.error}`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file for the brand logo');
      return;
    }

    setBrandsWorkedWith(prev => {
      const updated = prev.map(brand =>
        brand.id === brandId
          ? {
            ...brand,
            logoFile: file,
            logoPreview: URL.createObjectURL(file),
            isUploading: true,
            error: undefined
          }
          : brand
      );
      syncBrands(updated);
      return updated;
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/brand-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload brand logo');
      }

      const result = await response.json();

      if (result.url) {
        setBrandsWorkedWith(prev => {
          const updated = prev.map(brand =>
            brand.id === brandId
              ? {
                ...brand,
                logo: result.url,
                logoFile: undefined,
                isUploading: false,
                error: undefined
              }
              : brand
          );
          syncBrands(updated);
          return updated;
        });

        // Clean up blob URL
        const brand = brandsWorkedWith.find(b => b.id === brandId);
        if (brand?.logoPreview && brand.logoPreview.startsWith('blob:')) {
          URL.revokeObjectURL(brand.logoPreview);
        }

        toast.success('Brand logo uploaded successfully');
      }
    } catch (error) {
      setBrandsWorkedWith(prev => {
        const updated = prev.map(brand =>
          brand.id === brandId
            ? {
              ...brand,
              isUploading: false,
              error: 'Upload failed'
            }
            : brand
        );
        syncBrands(updated);
        return updated;
      });
      toast.error('Failed to upload brand logo');
    }

    if (brandLogoInputRef.current) brandLogoInputRef.current.value = '';
  };

  const triggerBrandLogoInput = (brandId: string) => {
    // Store the brandId temporarily to use in the upload handler
    (brandLogoInputRef.current as unknown as { brandId?: string }).brandId = brandId;
    brandLogoInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      portfolioImages.forEach(img => {
        // Only revoke blob URLs, not uploaded URLs
        if (img.file && img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [portfolioImages]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Upload your best images and short videos to showcase your work. You can add up to 5 items.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Supported images: {getFileTypeDisplay()} • Supported videos: {getVideoTypeDisplay()} • Max {getMaxFileSizeDisplay()} per file
        </p>
      </div>

      {portfolioImages.some(img => img.isUploading) && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            Uploading portfolio items...
          </AlertDescription>
        </Alert>
      )}

      {portfolioImages.some(img => img.error) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Some items failed to upload. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <Label className="text-lg mb-4 block">Portfolio Showcase</Label>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {portfolioImages.map((image, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                  {image.isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  ) : (
                    <>
                      {image.mediaType === 'video' ? (
                        <video
                          src={image.url || image.preview} // Use uploaded URL if available
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          loop
                          controls
                          onError={() => {
                            console.error('Video failed to load:', image.url || image.preview);
                            toast.error('Video failed to load');
                          }}
                        />
                      ) : (
                        <img
                          src={image.url || image.preview} // Use uploaded URL if available
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            console.error('Image failed to load:', image.url || image.preview);
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      )}
                      {image.url && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white p-1 rounded-full">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                        disabled={image.isUploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
                {image.error && (
                  <p className="text-xs text-red-600 mt-1 truncate">{image.error}</p>
                )}
              </CardContent>
            </Card>
          ))}

          {portfolioImages.length < 5 && (
            <Card
              className="border-dashed border-2 border-gray-300 hover:border-orange-400 transition-colors cursor-pointer"
              onClick={triggerFileInput}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <CardContent className="p-4">
                <div className="aspect-square flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 transition-colors">
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Add Image</span>
                  <span className="text-xs">{getFileTypeDisplay()}</span>
                  <span className="text-xs mt-1">Drop or Click</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={isProcessing || portfolioImages.length >= 5} />
        <input ref={videoInputRef} type="file" accept="video/*" multiple onChange={handleImageUpload} className="hidden" disabled={isProcessing || portfolioImages.length >= 5} />

        <div className="text-center mb-6">
          <div className="flex gap-2 justify-center mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileInput}
              disabled={portfolioImages.length >= 5 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {portfolioImages.length === 0 ? 'Upload Images' : 'Add Images'}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={triggerVideoInput}
              disabled={portfolioImages.length >= 5 || isProcessing}
            >
              <Video className="h-4 w-4 mr-2" />
              Add Videos
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {portfolioImages.length} of 5 items selected
          </p>
          {portfolioImages.some(img => img.isUploading) && (
            <p className="text-xs text-muted-foreground mt-1">
              Uploading items...
            </p>
          )}
          {portfolioImages.some(img => img.error) && (
            <p className="text-xs text-red-600 mt-1">
              Some items failed to upload. Please try again.
            </p>
          )}
        </div>
      </div>

      {/* Brands Worked With Section */}
      <div>
        <Label className="text-lg mb-4 block">Brands I&apos;ve Worked With</Label>
        <p className="text-sm text-gray-600 mb-4">
          Showcase the brands you&apos;ve collaborated with. Add their name, website, and logo to build credibility.
        </p>

        <div className="space-y-4 mb-6">
          {brandsWorkedWith.map((brand, index) => (
            <Card key={brand.id} className="p-4">
              <div className="flex items-start gap-4">
                {/* Brand Logo */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative group">
                    {brand.logo || brand.logoPreview ? (
                      <img
                        src={brand.logo || brand.logoPreview}
                        alt={`${brand.name} logo`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-gray-400" />
                    )}

                    {brand.isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90"
                      onClick={() => triggerBrandLogoInput(brand.id)}
                      disabled={brand.isUploading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Brand Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <Label htmlFor={`brand-name-${brand.id}`} className="text-sm font-medium">
                      Brand Name *
                    </Label>
                    <Input
                      id={`brand-name-${brand.id}`}
                      value={brand.name}
                      onChange={(e) => updateBrand(brand.id, 'name', e.target.value)}
                      placeholder="e.g., Nike, Coca-Cola, Apple"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`brand-url-${brand.id}`} className="text-sm font-medium">
                      Brand Website (Optional)
                    </Label>
                    <Input
                      id={`brand-url-${brand.id}`}
                      value={brand.url || ''}
                      onChange={(e) => updateBrand(brand.id, 'url', e.target.value)}
                      placeholder="https://www.brandname.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeBrand(brand.id)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {brand.error && (
                <p className="text-xs text-red-600 mt-2">{brand.error}</p>
              )}
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addBrand}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        </div>

        <input
          ref={brandLogoInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const brandId = (e.target as unknown as { brandId?: string }).brandId;
            if (brandId) {
              handleBrandLogoUpload(e, brandId);
            }
          }}
          className="hidden"
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tips for great portfolio items:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose high-quality, well-lit content</li>
          <li>• Showcase variety in your content style</li>
          <li>• Include items that represent your niche</li>
          <li>• Show your personality and creativity</li>
          <li>• Images should be at least 800x800 pixels</li>
        </ul>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-800">
          <strong>Ready to connect!</strong> Once you complete your profile, brands will be able to discover you
          and invite you to exciting campaigns that match your style and audience.
        </p>
      </div>
    </div>
  );
};

export default PortfolioStep;
