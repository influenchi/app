
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  DollarSign,
  Package,
  Search,
  CreditCard,
  Gift,
  Eye,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Users
} from "lucide-react";

interface PaymentCreator {
  creatorId: string;
  creatorName: string;
  email: string;
  profilePhoto?: string;
  completedDate: string;
  submissionCount: number;
  totalRequirements: number;
  budgetType: string;
  paymentStatus?: 'pending' | 'processing' | 'paid';
}

interface PaymentManagementProps {
  campaignId: string;
  campaign: any;
}

// Mock data for creators ready for payment
const mockPaymentCreators: PaymentCreator[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    image: '/placeholder.svg',
    email: 'sarah@example.com',
    rating: 4.8,
    completedTasks: 2,
    totalTasks: 2,
    totalEarnings: 500,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    submissionIds: ['sub-1', 'sub-2']
  },
  {
    id: '2',
    name: 'Marcus Chen',
    image: '/placeholder.svg',
    email: 'marcus@example.com',
    rating: 4.9,
    completedTasks: 3,
    totalTasks: 3,
    totalEarnings: 0, // Product exchange
    paymentStatus: 'pending',
    paymentMethod: 'product',
    submissionIds: ['sub-3', 'sub-4', 'sub-5']
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    image: '/placeholder.svg',
    email: 'emma@example.com',
    rating: 4.7,
    completedTasks: 1,
    totalTasks: 1,
    totalEarnings: 0, // Service exchange
    paymentStatus: 'paid',
    paymentMethod: 'service',
    submissionIds: ['sub-6']
  }
];

const PaymentManagement = ({ campaignId, campaign }: PaymentManagementProps) => {
  const [creators, setCreators] = useState<PaymentCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCreator, setSelectedCreator] = useState<PaymentCreator | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // Fetch creators due for payment
  useEffect(() => {
    const fetchCreatorsDueForPayment = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}/payment-due`);
        if (response.ok) {
          const data = await response.json();
          const creatorsWithStatus = data.creatorsDueForPayment.map((creator: PaymentCreator) => ({
            ...creator,
            paymentStatus: 'pending' as const
          }));
          setCreators(creatorsWithStatus);
        } else {
          console.error('Failed to fetch creators due for payment');
        }
      } catch (error) {
        console.error('Error fetching creators due for payment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorsDueForPayment();
  }, [campaignId]);

  // Filter creators ready for payment (completed all tasks with approved submissions)
  const filteredCreators = useMemo(() => {
    return creators.filter(creator => {
      const matchesSearch = creator.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          creator.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || creator.paymentStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [creators, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'product': return <Package className="h-4 w-4 text-purple-600" />;
      case 'service': return <Gift className="h-4 w-4 text-blue-600" />;
      default: return <DollarSign className="h-4 w-4 text-green-600" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'product': return 'Product Exchange';
      case 'service': return 'Service Exchange';
      default: return 'Cash Payment';
    }
  };

  const getPaymentAmount = (creator: PaymentCreator) => {
    if (creator.paymentMethod === 'product') {
      return 'Luxury resort stay + spa package';
    } else if (creator.paymentMethod === 'service') {
      return 'Guided mountain expedition + gear';
    } else {
      return `$${creator.totalEarnings}`;
    }
  };

  const renderStarRating = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    );
  };

  const handleProcessPayment = (creatorId: string) => {
    if (rating === 0) {
      alert('Please provide a rating before processing payment');
      return;
    }

    setCreators(prev => 
      prev.map(creator => 
        creator.id === creatorId 
          ? { ...creator, paymentStatus: 'processing' as const }
          : creator
      )
    );
    setShowPaymentDialog(false);
    setSelectedCreator(null);
    setRating(0);
    setReview('');
  };

  const handleMarkAsPaid = (creatorId: string) => {
    setCreators(prev => 
      prev.map(creator => 
        creator.id === creatorId 
          ? { ...creator, paymentStatus: 'paid' as const }
          : creator
      )
    );
  };

  const openPaymentDialog = (creator: PaymentCreator) => {
    setSelectedCreator(creator);
    setShowPaymentDialog(true);
    setRating(0);
    setReview('');
  };

  const totalPendingPayments = filteredCreators
    .filter(c => c.paymentStatus === 'pending' && c.paymentMethod === 'cash')
    .reduce((sum, c) => sum + c.totalEarnings, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading creators due for payment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredCreators.length === 0 && searchTerm === '' && statusFilter === 'all') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No creators ready for payment yet</p>
            <p className="text-sm text-gray-500 mt-2">Creators will appear here once they complete all tasks and have approved submissions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payment Management ({filteredCreators.length})</h2>
        {totalPendingPayments > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Pending Cash Payments</p>
            <p className="text-lg font-semibold">${totalPendingPayments}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by creator name..."
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
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Creators List */}
      {filteredCreators.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No creators match your search</p>
          </CardContent>
        </Card>
      ) : (
        filteredCreators.map((creator) => (
          <Card key={creator.creatorId} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={creator.profilePhoto || undefined} />
                    <AvatarFallback>{creator.creatorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{creator.creatorName}</h3>
                    <p className="text-sm text-gray-600">{creator.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(creator.paymentStatus || 'pending')}>
                    {creator.paymentStatus || 'pending'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Submissions</span>
                    <div className="flex items-center mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-semibold">{creator.submissionCount}/{creator.totalRequirements}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Budget Type</span>
                    <div className="flex items-center mt-1">
                      {getPaymentMethodIcon(creator.budgetType)}
                      <span className="ml-1 text-sm">{getPaymentMethodLabel(creator.budgetType)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Completed Date</span>
                    <p className="font-semibold mt-1 text-sm">
                      {new Date(creator.completedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Submissions</span>
                    <p className="font-semibold mt-1">{creator.submissionIds.length} assets</p>
                  </div>
                </div>

                {creator.paymentStatus === 'pending' && (
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openPaymentDialog(creator)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review & Pay
                    </Button>
                  </div>
                )}

                {creator.paymentStatus === 'processing' && (
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleMarkAsPaid(creator.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark as Paid
                    </Button>
                  </div>
                )}

                {creator.paymentStatus === 'paid' && (
                  <div className="flex items-center justify-end pt-4 border-t">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Payment Completed</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Payment Review Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Payment & Rate Creator</DialogTitle>
          </DialogHeader>
          {selectedCreator && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedCreator.image} />
                  <AvatarFallback>{selectedCreator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedCreator.name}</h3>
                  {renderStarRating(selectedCreator.rating)}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tasks Completed:</span>
                  <span className="font-medium">{selectedCreator.completedTasks}/{selectedCreator.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="font-medium">{getPaymentMethodLabel(selectedCreator.paymentMethod)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount Due:</span>
                  <span className="font-semibold text-sm">
                    {getPaymentAmount(selectedCreator)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Submitted Assets:</span>
                  <span className="font-medium">{selectedCreator.submissionIds.length}</span>
                </div>
              </div>

              {/* Rating Section */}
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Rate this creator's performance
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition-colors ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {rating > 0 ? `${rating}/5` : 'No rating'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Review (optional)
                  </label>
                  <Textarea
                    placeholder="Share your feedback about working with this creator..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleProcessPayment(selectedCreator.id)}
                  disabled={rating === 0}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Process Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
