
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Search,
  Filter,
  Tag,
  Eye,
  Play,
  Calendar,
  User,
  Camera,
  Video,
  Crown,
  Lock,
  AlertTriangle,
} from "lucide-react";

interface Asset {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  campaignId: string;
  campaignName: string;
  submittedDate: string;
  approvedDate: string;
  tags: string[];
  socialChannel: string;
  dimensions?: string;
  duration?: string;
  fileSize: string;
}

interface AssetLibraryProps {
  // Mock subscription data - in real app this would come from context/props
  subscriptionTier: 'basic' | 'premium' | 'enterprise' | null;
  monthlyDownloadsUsed: number;
  monthlyDownloadLimit: number;
}

// Mock data for demonstration
const mockAssets: Asset[] = [
  {
    id: '1',
    type: 'image',
    url: '/placeholder.svg',
    title: 'Luxury Hotel Lobby Shot',
    description: 'Professional shot of the hotel lobby with natural lighting',
    creatorId: '1',
    creatorName: 'Sarah Johnson',
    creatorImage: '/placeholder.svg',
    campaignId: 'camp-1',
    campaignName: 'Luxury Travel Experience',
    submittedDate: '2024-01-15',
    approvedDate: '2024-01-16',
    tags: ['luxury', 'hotel', 'interior'],
    socialChannel: 'Instagram',
    dimensions: '1080x1080',
    fileSize: '2.4 MB'
  },
  {
    id: '2',
    type: 'video',
    url: '/placeholder.svg',
    thumbnail: '/placeholder.svg',
    title: 'Adventure Activities Compilation',
    description: 'Dynamic video showcasing various adventure activities',
    creatorId: '2',
    creatorName: 'Marcus Chen',
    creatorImage: '/placeholder.svg',
    campaignId: 'camp-2',
    campaignName: 'Adventure Tourism',
    submittedDate: '2024-01-18',
    approvedDate: '2024-01-19',
    tags: ['adventure', 'outdoor', 'action'],
    socialChannel: 'TikTok',
    duration: '30s',
    fileSize: '15.2 MB'
  },
  {
    id: '3',
    type: 'image',
    url: '/placeholder.svg',
    title: 'Budget Travel Tips Infographic',
    description: 'Colorful infographic with money-saving travel tips',
    creatorId: '3',
    creatorName: 'Emma Rodriguez',
    creatorImage: '/placeholder.svg',
    campaignId: 'camp-3',
    campaignName: 'Budget Travel Campaign',
    submittedDate: '2024-01-20',
    approvedDate: '2024-01-21',
    tags: ['budget', 'tips', 'infographic'],
    socialChannel: 'Pinterest',
    dimensions: '1080x1350',
    fileSize: '1.8 MB'
  }
];

const AssetLibrary = ({ 
  subscriptionTier = 'basic', 
  monthlyDownloadsUsed = 18, 
  monthlyDownloadLimit = 20 
}: AssetLibraryProps) => {
  const [assets] = useState<Asset[]>(mockAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [newTags, setNewTags] = useState('');

  // Calculate remaining downloads
  const remainingDownloads = monthlyDownloadLimit - monthlyDownloadsUsed;
  const canDownload = remainingDownloads > 0;

  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'all' || asset.type === typeFilter;
      const matchesChannel = channelFilter === 'all' || asset.socialChannel === channelFilter;
      
      return matchesSearch && matchesType && matchesChannel;
    });
  }, [assets, searchTerm, typeFilter, channelFilter]);

  const handlePreview = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowPreviewDialog(true);
  };

  const handleDownload = (asset: Asset) => {
    if (!canDownload) {
      setShowUpgradeDialog(true);
      return;
    }
    
    // Mock download - in real app this would trigger actual download
    console.log('Downloading asset:', asset.title);
    // You would increment monthlyDownloadsUsed here in real implementation
  };

  const handleAddTags = (asset: Asset) => {
    setSelectedAsset(asset);
    setNewTags(asset.tags.join(', '));
    setShowTagDialog(true);
  };

  const saveTags = () => {
    if (selectedAsset) {
      const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      // In real app, you'd update the asset tags here
      console.log('Saving tags for asset:', selectedAsset.id, tagsArray);
    }
    setShowTagDialog(false);
    setNewTags('');
    setSelectedAsset(null);
  };

  const getSubscriptionLimitInfo = () => {
    switch (subscriptionTier) {
      case 'basic': return { limit: 20, name: 'Basic' };
      case 'premium': return { limit: 100, name: 'Premium' };
      case 'enterprise': return { limit: 500, name: 'Enterprise' };
      default: return { limit: 5, name: 'Free' };
    }
  };

  const subscriptionInfo = getSubscriptionLimitInfo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Asset Library</h1>
          <p className="text-muted-foreground">Manage and download your approved campaign assets</p>
        </div>
        
        {/* Download Usage */}
        <Card className="w-80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Monthly Downloads</span>
              <Badge variant={canDownload ? "default" : "destructive"}>
                {subscriptionInfo.name}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{monthlyDownloadsUsed}</span>
              <span className="text-muted-foreground">/ {monthlyDownloadLimit}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  monthlyDownloadsUsed >= monthlyDownloadLimit ? 'bg-destructive' : 'bg-primary'
                }`}
                style={{ width: `${Math.min((monthlyDownloadsUsed / monthlyDownloadLimit) * 100, 100)}%` }}
              />
            </div>
            {!canDownload && (
              <Button 
                size="sm" 
                className="w-full mt-2"
                onClick={() => setShowUpgradeDialog(true)}
              >
                <Crown className="h-4 w-4 mr-1" />
                Upgrade Plan
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="TikTok">TikTok</SelectItem>
            <SelectItem value="YouTube">YouTube</SelectItem>
            <SelectItem value="Pinterest">Pinterest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No assets match your search criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset, index) => {
            const isLocked = !canDownload && index >= remainingDownloads;
            
            return (
              <Card key={asset.id} className={`overflow-hidden ${isLocked ? 'opacity-75' : ''}`}>
                <div className="relative aspect-square">
                  <img 
                    src={asset.thumbnail || asset.url} 
                    alt={asset.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Type indicator */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {asset.type === 'video' ? (
                        <><Video className="h-3 w-3 mr-1" />Video</>
                      ) : (
                        <><Camera className="h-3 w-3 mr-1" />Image</>
                      )}
                    </Badge>
                  </div>

                  {/* Lock overlay for exceeded limit */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Lock className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Upgrade to Download</p>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="h-8 w-8 p-0"
                      onClick={() => handlePreview(asset)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">{asset.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{asset.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={asset.creatorImage} />
                      <AvatarFallback>{asset.creatorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{asset.creatorName}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {asset.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{asset.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddTags(asset)}
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleDownload(asset)}
                        disabled={isLocked}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">{asset.fileSize}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview Dialog - Enhanced responsiveness */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] lg:max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{selectedAsset?.title}</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                {selectedAsset.type === 'video' ? (
                  <div className="text-center">
                    <Play className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm sm:text-base text-muted-foreground">Video Preview</p>
                  </div>
                ) : (
                  <img 
                    src={selectedAsset.url} 
                    alt={selectedAsset.title}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p><strong>Creator:</strong> {selectedAsset.creatorName}</p>
                  <p><strong>Campaign:</strong> {selectedAsset.campaignName}</p>
                  <p><strong>Channel:</strong> {selectedAsset.socialChannel}</p>
                </div>
                <div className="space-y-1">
                  <p><strong>Approved:</strong> {selectedAsset.approvedDate}</p>
                  <p><strong>File Size:</strong> {selectedAsset.fileSize}</p>
                  {selectedAsset.dimensions && <p><strong>Dimensions:</strong> {selectedAsset.dimensions}</p>}
                  {selectedAsset.duration && <p><strong>Duration:</strong> {selectedAsset.duration}</p>}
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Description:</p>
                <p className="text-muted-foreground text-sm">{selectedAsset.description}</p>
              </div>
              
              <div>
                <p className="font-medium mb-2">Tags:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedAsset.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Tags Dialog - Enhanced responsiveness */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Textarea
                placeholder="luxury, hotel, interior, professional..."
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTagDialog(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={saveTags} className="w-full sm:w-auto">
                Save Tags
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog - Enhanced responsiveness */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="w-[95vw] max-w-lg">
          <DialogHeader>
            <DialogTitle>Download Limit Reached</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-muted rounded-lg">
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-medium">Monthly download limit exceeded</p>
                <p className="text-sm text-muted-foreground">
                  You've reached your monthly limit of {monthlyDownloadLimit} downloads.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="font-medium">Choose an option:</p>
              <div className="grid gap-3">
                <Button className="justify-start text-left h-auto p-4">
                  <Crown className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">Upgrade to Premium</div>
                    <div className="text-xs text-muted-foreground">100 downloads/month</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start text-left h-auto p-4">
                  <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">Pay per download</div>
                    <div className="text-xs text-muted-foreground">$2 per asset</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetLibrary;
