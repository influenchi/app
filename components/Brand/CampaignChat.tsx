import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Paperclip, 
  Users, 
  MessageCircle,
  Plus,
  Search,
  ExternalLink
} from "lucide-react";

interface CampaignChatProps {
  campaignId: string;
}

// Mock data for approved creators
const approvedCreators = [
  { id: '1', name: 'Sarah Johnson', avatar: '', unreadCount: 2, profileUrl: '/creator/sarah-johnson' },
  { id: '2', name: 'Mike Chen', avatar: '', unreadCount: 0, profileUrl: '/creator/mike-chen' },
  { id: '3', name: 'Emily Rodriguez', avatar: '', unreadCount: 1, profileUrl: '/creator/emily-rodriguez' },
  { id: '4', name: 'David Kim', avatar: '', unreadCount: 0, profileUrl: '/creator/david-kim' },
];

// Mock messages
const mockMessages = {
  announcements: [
    {
      id: '1',
      sender: 'Brand',
      message: 'Welcome to the campaign! Please review the guidelines and let us know if you have any questions.',
      timestamp: '2024-01-15 10:30',
      type: 'announcement'
    },
    {
      id: '2',
      sender: 'Brand',
      message: 'Reminder: Content submissions are due by Friday. Make sure to follow the brand guidelines.',
      timestamp: '2024-01-16 14:15',
      type: 'announcement'
    }
  ],
  individual: {
    '1': [
      {
        id: '1',
        sender: 'Sarah Johnson',
        message: 'Hi! I have a question about the product shots. Should they be on a white background?',
        timestamp: '2024-01-16 09:30',
        type: 'received'
      },
      {
        id: '2',
        sender: 'Brand',
        message: 'Yes, white background would be perfect! Make sure the lighting is even.',
        timestamp: '2024-01-16 09:45',
        type: 'sent'
      }
    ]
  }
};

const CampaignChat = ({ campaignId }: CampaignChatProps) => {
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleSendAnnouncement = () => {
    if (announcementMessage.trim()) {
      console.log('Sending announcement:', announcementMessage);
      setAnnouncementMessage('');
    }
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,application/pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('File selected:', file.name);
        // Handle file upload logic here
      }
    };
    input.click();
  };

  const handleViewProfile = (profileUrl: string) => {
    console.log('Viewing profile:', profileUrl);
    // In a real app, this would navigate to the creator's profile
    window.open(profileUrl, '_blank');
  };

  const filteredCreators = approvedCreators.filter(creator =>
    creator.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCreatorData = selectedCreator ? 
    approvedCreators.find(c => c.id === selectedCreator) : null;

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
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  selectedCreator === null ? 'bg-blue-50 border-r-2 border-blue-500' : ''
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
              {filteredCreators.map((creator) => (
                <button
                  key={creator.id}
                  onClick={() => setSelectedCreator(creator.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedCreator === creator.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
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
                  onClick={() => handleViewProfile(selectedCreatorData.profileUrl)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
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
                {selectedCreator === null ? (
                  // Show announcements
                  mockMessages.announcements.map((message) => (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-xs lg:max-w-md">
                        <div className="bg-blue-500 text-white rounded-lg px-4 py-2">
                          <p>{message.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Show individual conversation
                  mockMessages.individual[selectedCreator]?.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-xs lg:max-w-md">
                        <div className={`rounded-lg px-4 py-2 ${
                          message.type === 'sent' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p>{message.message}</p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${
                          message.type === 'sent' ? 'text-right' : 'text-left'
                        }`}>
                          {message.sender} • {message.timestamp}
                        </p>
                      </div>
                    </div>
                  )) || []
                )}
              </div>
            </ScrollArea>

            <Separator />

            {/* Message Input */}
            <div className="p-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFileUpload}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      selectedCreator === null ? handleSendAnnouncement() : handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={selectedCreator === null ? handleSendAnnouncement : handleSendMessage}
                  disabled={selectedCreator === null ? !announcementMessage.trim() : !newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignChat;
