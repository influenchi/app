import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Paperclip,
  Users,
  MessageCircle,
  Search,
  ExternalLink,
  FileText,
  Image,
  X,
  Loader2,
  Eye,
  Shield,
  Instagram,
  Youtube,
  Twitter,
  MapPin
} from "lucide-react";
import { useMessages } from "@/lib/hooks/useMessages";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface CampaignChatProps {
  campaignId: string;
  messageId?: string;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  unreadCount: number;
}

interface CreatorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  profile_photo?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  website?: string;
  primary_niche?: string;
  secondary_niches?: string[];
  portfolio_images?: string[];
  is_vetted?: boolean;
  total_followers?: string;
  primary_platform?: string;
  engagement_rate?: string;
}

const CampaignChat = ({ campaignId, messageId: propMessageId }: CampaignChatProps) => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [showCreatorProfile, setShowCreatorProfile] = useState(false);
  const [selectedCreatorProfile, setSelectedCreatorProfile] = useState<CreatorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Debug state changes
  useEffect(() => {

  }, [showCreatorProfile, selectedCreatorProfile, loadingProfile]);
  const [newMessage, setNewMessage] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, uploadingFiles, isSending } = useMessages(campaignId);

  // Fetch campaign participants (accepted creators)
  const { data: participants = [] } = useQuery({
    queryKey: ['campaign-participants', campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/participants`);
      if (!response.ok) {
        if (response.status === 404) {

          return [];
        }
        throw new Error('Failed to fetch participants');
      }
      const data = await response.json();
      return data.participants.map((p: Participant) => ({
        ...p,
        unreadCount: 0 // Will be calculated from messages
      }));
    },
    enabled: !!campaignId,
    retry: (failureCount, error) => {
      // Retry on 404s up to 3 times with delay
      if (error instanceof Error && error.message.includes('404')) {
        return failureCount < 3;
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Calculate unread counts
  useEffect(() => {
    if (messages && participants) {
      const unreadCounts: Record<string, number> = {};

      messages.forEach(msg => {
        if (!msg.is_read && msg.sender_id !== session?.user?.id) {
          unreadCounts[msg.sender_id] = (unreadCounts[msg.sender_id] || 0) + 1;
        }
      });

      // Update participants with unread counts
      participants.forEach((p: Participant) => {
        p.unreadCount = unreadCounts[p.id] || 0;
      });
    }
  }, [messages, participants, session]);

  // Handle deep linking to specific messages
  useEffect(() => {
    const messageId = propMessageId || searchParams?.get('message');
    if (messageId && messages.length > 0) {
      // Find the message in the current messages
      const targetMessage = messages.find(msg => msg.id === messageId);

      if (targetMessage) {
        // Set the correct creator selection based on message
        if (targetMessage.is_broadcast) {
          setSelectedCreator(null); // Announcements
        } else {
          // Select the creator who sent or received the message
          const creatorId = targetMessage.sender_id === session?.user?.id
            ? targetMessage.recipient_id
            : targetMessage.sender_id;
          setSelectedCreator(creatorId);
        }

        // Highlight the message temporarily
        setHighlightedMessageId(messageId);

        // Scroll to the message after a short delay to ensure rendering
        setTimeout(() => {
          const messageElement = document.getElementById(`message-${messageId}`);
          if (messageElement) {
            messageElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }, 100);

        // Remove highlight after 3 seconds
        setTimeout(() => {
          setHighlightedMessageId(null);
        }, 3000);
      }
    }
  }, [messages, searchParams, session?.user?.id, propMessageId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() || attachedFiles.length > 0) {
      await sendMessage(newMessage, attachedFiles, selectedCreator || undefined, false);
      setNewMessage('');
      setAttachedFiles([]);
    }
  };

  const handleSendAnnouncement = async () => {
    if (announcementMessage.trim() || attachedFiles.length > 0) {
      await sendMessage(announcementMessage, attachedFiles, undefined, true);
      setAnnouncementMessage('');
      setAttachedFiles([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf';
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        return isValidType && isValidSize;
      });

      setAttachedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewProfile = async (creatorId: string) => {

    setLoadingProfile(true);
    try {
      // Fetch creator profile via API route (server-side to bypass RLS)

      const response = await fetch(`/api/creator/profile/${creatorId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();

      if (!response.ok) {
        console.error('API error:', result);
        toast.error('Unable to fetch profile');
        return;
      }

      if (!result.profile) {
        console.error('No profile data in response');
        toast.error('Unable to fetch profile');
        return;
      }

      setSelectedCreatorProfile(result.profile);
      setShowCreatorProfile(true);
    } catch (error) {
      console.error('Unexpected error fetching creator profile:', error);
      toast.error('Unable to fetch profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'tiktok': return <Image className="h-4 w-4 text-black" />;
      case 'twitter': return <Twitter className="h-4 w-4 text-blue-400" />;
      case 'website': return <ExternalLink className="h-4 w-4 text-gray-600" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const formatFollowers = (count: number | null | undefined): string => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const filteredParticipants = participants.filter((p: Participant) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCreatorData = selectedCreator ?
    participants.find((p: Participant) => p.id === selectedCreator) : null;

  // Filter messages based on selection
  const displayMessages = selectedCreator === null
    ? messages.filter(m => m.is_broadcast)
    : messages.filter(m =>
      (m.sender_id === selectedCreator && m.recipient_id === session?.user?.id) ||
      (m.sender_id === session?.user?.id && m.recipient_id === selectedCreator)
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Left Sidebar - Creator List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {/* Announcements option */}
              <button
                onClick={() => setSelectedCreator(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedCreator === null ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
              >
                <div className="p-2 bg-blue-100 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Announcements</p>
                  <p className="text-sm text-gray-500">Broadcast to all</p>
                </div>
              </button>

              {/* Individual creators */}
              {filteredParticipants.map((creator: Participant) => (
                <button
                  key={creator.id}
                  onClick={() => setSelectedCreator(creator.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedCreator === creator.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={creator.avatar} />
                    <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{creator.name}</p>
                    {creator.unreadCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-blue-600">{creator.unreadCount} new</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {selectedCreator === null ? (
                  <>
                    <Users className="h-5 w-5" />
                    Campaign Announcements
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5" />
                    {selectedCreatorData?.name}
                  </>
                )}
              </CardTitle>
              {selectedCreatorData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {

                    if (selectedCreator) {
                      handleViewProfile(selectedCreator);
                    } else {
                      console.error('No selected creator ID');
                      toast.error('No creator selected');
                    }
                  }}
                  disabled={loadingProfile}
                  className="flex items-center gap-2"
                >
                  {loadingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  View Profile
                </Button>
              )}
            </div>
            <Separator />
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : displayMessages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  displayMessages.map((message) => {
                    const isSent = message.sender_id === session?.user?.id;
                    const isHighlighted = highlightedMessageId === message.id;
                    return (
                      <div key={message.id} id={`message-${message.id}`} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-xs lg:max-w-md">
                          <div className={`rounded-lg px-4 py-2 transition-all duration-300 ${isHighlighted
                            ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-lg'
                            : ''
                            } ${isSent
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                            }`}>
                            <p className="whitespace-pre-wrap">{message.message}</p>

                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment, idx) => (
                                  <a
                                    key={idx}
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 p-2 rounded ${isSent ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300'
                                      } transition-colors`}
                                  >
                                    {attachment.type.startsWith('image/') ? (
                                      <Image className="h-4 w-4" />
                                    ) : (
                                      <FileText className="h-4 w-4" />
                                    )}
                                    <span className="text-sm truncate">{attachment.name}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isSent ? 'text-right' : 'text-left'
                            }`}>
                            {message.sender?.name || 'Unknown'} • {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <Separator />

            {/* Attached Files Preview */}
            {attachedFiles.length > 0 && (
              <div className="px-4 py-2 border-t">
                <div className="flex gap-2 flex-wrap">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1">
                      {file.type.startsWith('image/') ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFiles || isSending}
                  title="Upload file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Textarea
                  placeholder={
                    selectedCreator === null
                      ? "Write an announcement to all approved creators..."
                      : "Type your message..."
                  }
                  value={selectedCreator === null ? announcementMessage : newMessage}
                  onChange={(e) =>
                    selectedCreator === null
                      ? setAnnouncementMessage(e.target.value)
                      : setNewMessage(e.target.value)
                  }
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={uploadingFiles || isSending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      selectedCreator === null ? handleSendAnnouncement() : handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={selectedCreator === null ? handleSendAnnouncement : handleSendMessage}
                  disabled={(selectedCreator === null ? !announcementMessage.trim() : !newMessage.trim()) && attachedFiles.length === 0 || uploadingFiles || isSending}
                >
                  {uploadingFiles || isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line. Images and PDFs only (max 10MB).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Creator Profile Dialog */}
      <Dialog open={showCreatorProfile} onOpenChange={setShowCreatorProfile}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          {selectedCreatorProfile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Creator Profile
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Profile Header */}
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedCreatorProfile.profile_photo || undefined} alt="" />
                    <AvatarFallback className="text-lg">
                      {selectedCreatorProfile.display_name?.split(' ').map(n => n[0]).join('') || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold flex items-center gap-2">
                      {selectedCreatorProfile.display_name || 'Creator'}
                      {selectedCreatorProfile.is_vetted && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </h3>
                    {selectedCreatorProfile.primary_niche && (
                      <p className="text-lg text-gray-600 mt-1">{selectedCreatorProfile.primary_niche}</p>
                    )}
                    {(selectedCreatorProfile.secondary_niches && selectedCreatorProfile.secondary_niches.length > 0) && (
                      <p className="text-sm text-gray-500 mt-1">
                        Also: {selectedCreatorProfile.secondary_niches.join(', ')}
                      </p>
                    )}
                    {(selectedCreatorProfile.city || selectedCreatorProfile.state || selectedCreatorProfile.country) && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                        <MapPin className="h-4 w-4" />
                        {[selectedCreatorProfile.city, selectedCreatorProfile.state, selectedCreatorProfile.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Primary Platform:</span>
                        <Badge variant="outline">{selectedCreatorProfile.primary_platform}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Followers:</span>
                        <Badge variant="outline">{selectedCreatorProfile.total_followers}</Badge>
                      </div>
                      {selectedCreatorProfile.engagement_rate && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Engagement:</span>
                          <Badge variant="outline">{selectedCreatorProfile.engagement_rate}%</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedCreatorProfile.bio && (
                  <div>
                    <h4 className="font-semibold mb-3">About</h4>
                    <p className="text-gray-700 leading-relaxed">{selectedCreatorProfile.bio}</p>
                  </div>
                )}

                {/* Social Channels */}
                <div>
                  <h4 className="font-semibold mb-3">Social Channels</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCreatorProfile.instagram && (
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {getSocialIcon('instagram')}
                          <div>
                            <p className="font-medium">Instagram</p>
                            <p className="text-sm text-gray-600">@{selectedCreatorProfile.instagram}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://instagram.com/${selectedCreatorProfile.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                    {selectedCreatorProfile.tiktok && (
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {getSocialIcon('tiktok')}
                          <div>
                            <p className="font-medium">TikTok</p>
                            <p className="text-sm text-gray-600">@{selectedCreatorProfile.tiktok}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://tiktok.com/@${selectedCreatorProfile.tiktok}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                    {selectedCreatorProfile.youtube && (
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {getSocialIcon('youtube')}
                          <div>
                            <p className="font-medium">YouTube</p>
                            <p className="text-sm text-gray-600">@{selectedCreatorProfile.youtube}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://youtube.com/@${selectedCreatorProfile.youtube}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                    {selectedCreatorProfile.twitter && (
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {getSocialIcon('twitter')}
                          <div>
                            <p className="font-medium">Twitter</p>
                            <p className="text-sm text-gray-600">@{selectedCreatorProfile.twitter}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://twitter.com/${selectedCreatorProfile.twitter}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                    {selectedCreatorProfile.website && (
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {getSocialIcon('website')}
                          <div>
                            <p className="font-medium">Website</p>
                            <p className="text-sm text-gray-600">{selectedCreatorProfile.website}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={selectedCreatorProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Portfolio */}
                {selectedCreatorProfile.portfolio_images && selectedCreatorProfile.portfolio_images.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Portfolio</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedCreatorProfile.portfolio_images.map((image, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                          <img
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignChat;
