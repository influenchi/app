
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Check,
  X,
  ExternalLink,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Search,
} from "lucide-react";

interface Creator {
  id: string;
  name: string;
  profileImage: string;
  socialChannels: {
    platform: 'instagram' | 'youtube' | 'facebook' | 'twitter';
    handle: string;
    url: string;
    followers: number;
  }[];
  quote: number;
  status: 'pending' | 'approved' | 'denied';
  viewed: boolean;
  appliedDate: string;
  specialty: string;
  location: string;
  bio: string;
  portfolioImages: string[];
}

interface CreatorsTableProps {
  campaignId: string;
}

// Mock data for demonstration
const mockCreators: Creator[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    profileImage: '/placeholder.svg',
    socialChannels: [
      { platform: 'instagram', handle: '@sarahtravels', url: 'https://instagram.com/sarahtravels', followers: 45000 },
      { platform: 'youtube', handle: 'Sarah\'s Adventures', url: 'https://youtube.com/sarahsadventures', followers: 23000 }
    ],
    quote: 1200,
    status: 'pending',
    viewed: true,
    appliedDate: '2024-01-15',
    specialty: 'Adventure Travel',
    location: 'California, USA',
    bio: 'Adventure travel photographer and storyteller with a passion for capturing authentic moments in remote destinations. I specialize in outdoor adventures, cultural immersion, and sustainable travel practices.',
    portfolioImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
  },
  {
    id: '2',
    name: 'Marcus Chen',
    profileImage: '/placeholder.svg',
    socialChannels: [
      { platform: 'instagram', handle: '@wanderlustmarcus', url: 'https://instagram.com/wanderlustmarcus', followers: 67000 },
      { platform: 'twitter', handle: '@marcustravels', url: 'https://twitter.com/marcustravels', followers: 12000 }
    ],
    quote: 0,
    status: 'approved',
    viewed: true,
    appliedDate: '2024-01-14',
    specialty: 'Luxury Travel',
    location: 'New York, USA',
    bio: 'Luxury travel curator focusing on high-end experiences and premium destinations. I create content that showcases the finest hotels, restaurants, and exclusive travel experiences around the world.',
    portfolioImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    profileImage: '/placeholder.svg',
    socialChannels: [
      { platform: 'instagram', handle: '@emmaexplores', url: 'https://instagram.com/emmaexplores', followers: 32000 },
      { platform: 'youtube', handle: 'Emma Explores', url: 'https://youtube.com/emmaexplores', followers: 18000 }
    ],
    quote: 800,
    status: 'pending',
    viewed: false,
    appliedDate: '2024-01-16',
    specialty: 'Budget Travel',
    location: 'Barcelona, Spain',
    bio: 'Budget travel expert helping fellow travelers explore the world without breaking the bank. I share practical tips, hidden gems, and affordable alternatives for amazing travel experiences.',
    portfolioImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
  },
  {
    id: '4',
    name: 'David Kim',
    profileImage: '/placeholder.svg',
    socialChannels: [
      { platform: 'instagram', handle: '@davidwanders', url: 'https://instagram.com/davidwanders', followers: 89000 },
      { platform: 'facebook', handle: 'David\'s Travel Journal', url: 'https://facebook.com/davidstraveljournal', followers: 25000 }
    ],
    quote: 0,
    status: 'denied',
    viewed: true,
    appliedDate: '2024-01-13',
    specialty: 'Cultural Travel',
    location: 'Seoul, South Korea',
    bio: 'Cultural travel photographer documenting traditions, festivals, and local life around the world. I believe in respectful travel that celebrates and preserves cultural heritage.',
    portfolioImages: ['/placeholder.svg', '/placeholder.svg']
  }
];

const CreatorsTable = ({ campaignId }: CreatorsTableProps) => {
  const [creators, setCreators] = useState<Creator[]>(mockCreators);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-500" />;
      case 'twitter': return <Twitter className="h-4 w-4 text-blue-400" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleStatusChange = (creatorId: string, newStatus: 'approved' | 'denied') => {
    setCreators(prev => 
      prev.map(creator => 
        creator.id === creatorId 
          ? { ...creator, status: newStatus }
          : creator
      )
    );
  };

  const handleViewCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setCreators(prev => 
      prev.map(c => 
        c.id === creator.id 
          ? { ...c, viewed: true }
          : c
      )
    );
  };

  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
      const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           creator.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           creator.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           creator.bio.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || creator.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [creators, searchTerm, statusFilter]);

  if (selectedCreator) {
    const currentIndex = filteredCreators.findIndex(c => c.id === selectedCreator.id);
    const nextCreator = filteredCreators[currentIndex + 1];
    const prevCreator = filteredCreators[currentIndex - 1];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Creator Profile
            </CardTitle>
            <Button variant="outline" onClick={() => setSelectedCreator(null)}>
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedCreator.profileImage} />
                <AvatarFallback>{selectedCreator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{selectedCreator.name}</h3>
                <p className="text-gray-600">{selectedCreator.specialty}</p>
                <p className="text-sm text-gray-500">{selectedCreator.location}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Social Channels</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCreator.socialChannels.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getSocialIcon(channel.platform)}
                      <div>
                        <p className="font-medium">{channel.handle}</p>
                        <p className="text-sm text-gray-600">{formatFollowers(channel.followers)} followers</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={channel.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Bio</h4>
              <p className="text-gray-700">{selectedCreator.bio}</p>
            </div>

            <div>
              <h4 className="font-medium mb-3">Portfolio</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedCreator.portfolioImages.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={image} 
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Quote</p>
                <p className="text-2xl font-bold">
                  ${selectedCreator.quote}
                </p>
              </div>
            </div>
              
            {selectedCreator.status === 'pending' && (
              <div className="flex space-x-2 justify-center">
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleStatusChange(selectedCreator.id, 'denied')}
                >
                  <X className="h-4 w-4 mr-1" />
                  Deny Creator
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusChange(selectedCreator.id, 'approved')}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve Creator
                </Button>
              </div>
            )}

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => prevCreator && setSelectedCreator(prevCreator)}
                disabled={!prevCreator}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={() => nextCreator && setSelectedCreator(nextCreator)}
                disabled={!nextCreator}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Campaign Creators ({filteredCreators.length})</span>
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, specialty, location, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Social Channels</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Quote</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCreators.map((creator) => (
              <TableRow key={creator.id} className={!creator.viewed ? 'bg-blue-50' : ''}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={creator.profileImage} />
                      <AvatarFallback>{creator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{creator.name}</p>
                        {!creator.viewed && (
                          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{creator.location}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {creator.socialChannels.map((channel, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {getSocialIcon(channel.platform)}
                        <span className="text-sm">{formatFollowers(channel.followers)}</span>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                          <a href={channel.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{creator.specialty}</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">
                    ${creator.quote}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(creator.status)}>
                    {creator.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewCreator(creator)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {creator.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleStatusChange(creator.id, 'approved')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleStatusChange(creator.id, 'denied')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredCreators.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No creators found matching your criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreatorsTable;
