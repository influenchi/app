import { useRef, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, Upload, Loader2, CheckCircle, AlertTriangle, Video } from "lucide-react";
import { CreatorProfileData } from "../types";
import { validateImageFile, getFileTypeDisplay, getMaxFileSizeDisplay } from "@/lib/utils/storageUtils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PortfolioStepProps {
  profileData: CreatorProfileData;
  onUpdateData: (field: string, value: unknown) => void;
}

interface PortfolioImage {
  file?: File;
  url?: string;
  preview: string;
  isUploading?: boolean;
  error?: string;
}

const PortfolioStep = ({ profileData, onUpdateData }: PortfolioStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize portfolio images from profileData only once
  useEffect(() => {
    if (!hasInitialized && profileData.portfolioImages && profileData.portfolioImages.length > 0) {
      const images: PortfolioImage[] = profileData.portfolioImages.map((item) => {
        if (typeof item === 'string') {
          // It's a URL from database
          return { url: item, preview: item };
        } else if (item instanceof File) {
          // It's a File object
          return { file: item, preview: URL.createObjectURL(item) };
        }
        return { preview: '' };
      }).filter(img => img.preview);

      setPortfolioImages(images);
      setHasInitialized(true);
    }
  }, [profileData.portfolioImages, hasInitialized]);

  // Update parent component when portfolio images change (but not on initialization)
  useEffect(() => {
    // Skip the first render to avoid circular updates
    if (!hasInitialized) return;

    // Extract files and URLs for parent component
    const filesAndUrls = portfolioImages.map(img => img.file || img.url).filter(Boolean);
    onUpdateData('portfolioImages', filesAndUrls);
  }, [portfolioImages, hasInitialized, onUpdateData]); // onUpdateData is now stable via useCallback

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const remainingSlots = 5 - portfolioImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const newImages: PortfolioImage[] = [];

    for (const file of filesToProcess) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      newImages.push({
        file,
        preview,
        isUploading: false
      });
    }

    if (newImages.length > 0) {
      setPortfolioImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) added. They will be uploaded when you complete your profile.`);
    }

    setIsProcessing(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setPortfolioImages(prev => {
      const newImages = [...prev];
      // Clean up object URL if it exists
      if (newImages[index].file && newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
    toast.info('Image removed');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      // Create a synthetic event for the file handler
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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      portfolioImages.forEach(img => {
        if (img.file && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [portfolioImages]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600">
          Upload your best content images to showcase your work to brands. You can add up to 5 images.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Supported: {getFileTypeDisplay()}, max {getMaxFileSizeDisplay()} per image
        </p>
      </div>

      {/* Upload Progress Alert */}
      {portfolioImages.some(img => img.isUploading) && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            Uploading portfolio images...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {portfolioImages.some(img => img.error) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Some images failed to upload. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Portfolio Images Grid */}
      <div>
        <Label className="text-lg mb-4 block">Portfolio Showcase</Label>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Existing Images */}
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
                      <img
                        src={image.preview}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', image.preview);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
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

          {/* Add New Image Button */}
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

        {/* Hidden File Input */}
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={isProcessing || portfolioImages.length >= 5} />
        <input ref={videoInputRef} type="file" accept="video/*" multiple onChange={handleImageUpload} className="hidden" disabled={isProcessing || portfolioImages.length >= 5} />

        {/* Upload Instructions */}
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
            {portfolioImages.length} of 5 images selected
          </p>
          {portfolioImages.length > 0 && portfolioImages.some(img => img.file) && (
            <p className="text-xs text-muted-foreground mt-1">
              Images will be uploaded when you complete your profile
            </p>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tips for great portfolio images:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose high-quality, well-lit photos</li>
          <li>• Showcase variety in your content style</li>
          <li>• Include images that represent your niche</li>
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
