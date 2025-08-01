
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  X,
  Eye,
  MessageSquare,
  Play,
  ExternalLink,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Upload,
  Search,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useBrandSubmissions, useUpdateSubmission } from "@/lib/hooks/useBrand";
import Image from 'next/image';

interface Submission {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  campaignId?: string;
  campaignName?: string;
  taskId: string;
  taskDescription: string;
  contentType: string;
  socialChannel: string;
  quantity: number;
  submittedAssets: {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    title: string;
  }[];
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  rejectionComment?: string;
}

interface SubmissionsViewProps {
  campaignId: string;
}

const SubmissionsView = ({ campaignId }: SubmissionsViewProps) => {
  const { data: submissions = [], isLoading, error } = useBrandSubmissions();
  const updateSubmission = useUpdateSubmission();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Simple filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtered submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission: any) => {
      const matchesSearch = submission.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.taskDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      const matchesCampaign = !campaignId || submission.campaignId === campaignId;

      return matchesSearch && matchesStatus && matchesCampaign;
    });
  }, [submissions, searchTerm, statusFilter, campaignId]);

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="h-4 w-4 text-pink-500" />;
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'facebook': return <Facebook className="h-4 w-4 text-blue-500" />;
      case 'twitter': return <Twitter className="h-4 w-4 text-blue-400" />;
      case 'tiktok': return <div className="h-4 w-4 bg-black rounded-full"></div>;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleApproveSubmission = (submissionId: string) => {
    updateSubmission.mutate({
      submissionId,
      status: 'approved'
    });
  };

  const handleRejectSubmission = (submissionId: string, comment: string) => {
    updateSubmission.mutate({
      submissionId,
      status: 'rejected',
      rejectionComment: comment
    });
    setShowRejectDialog(false);
    setRejectionComment('');
    setSelectedSubmission(null);
  };

  const openRejectDialog = (submission: Submission) => {
    setSelectedSubmission(submission);
    setRejectionComment(submission.rejectionComment || '');
    setShowRejectDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-2">Failed to load submissions</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions yet</p>
            <p className="text-sm text-gray-500 mt-2">Approved creators will submit their work here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Campaign Submissions ({filteredSubmissions.length})</h2>
      </div>

      {/* Simple Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by creator name or task description..."
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
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions match your search</p>
          </CardContent>
        </Card>
      ) : (
        filteredSubmissions.map((submission: any) => (
          <Card key={submission.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={submission.creatorImage} />
                    <AvatarFallback>{submission.creatorName.split(' ').map((n: any) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{submission.creatorName}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Submitted {submission.submittedDate}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Task Description</h4>
                  <p className="text-sm text-gray-600">{submission.taskDescription}</p>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-3">
                    Submitted Assets ({submission.submittedAssets.length}/{submission.quantity})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {submission.submittedAssets.map((asset: any) => (
                      <div key={asset.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          {asset.type === 'video' ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={asset.thumbnail || asset.url}
                                alt={asset.title}
                                className="w-full h-full object-cover"
                                width={100}
                                height={100}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          ) : (
                            <Image
                              src={asset.url}
                              alt={asset.title}
                              className="w-full h-full object-cover"
                              width={100}
                              height={100}
                            />
                          )}
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">{asset.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {submission.status === 'rejected' && submission.rejectionComment && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Rejection Feedback</p>
                        <p className="text-sm text-red-700 mt-1">{submission.rejectionComment}</p>
                      </div>
                    </div>
                  </div>
                )}

                {submission.status === 'pending' && (
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => openRejectDialog(submission)}
                      disabled={updateSubmission.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveSubmission(submission.id)}
                      disabled={updateSubmission.isPending}
                    >
                      {updateSubmission.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide feedback for the creator about why this submission is being rejected.
            </p>
            <Textarea
              placeholder="Enter your feedback here..."
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => selectedSubmission && handleRejectSubmission(selectedSubmission.id, rejectionComment)}
                disabled={!rejectionComment.trim() || updateSubmission.isPending}
              >
                {updateSubmission.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Reject Submission'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionsView;
