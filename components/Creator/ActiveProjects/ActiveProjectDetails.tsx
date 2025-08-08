/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMessages } from "@/lib/hooks/useMessages";
import { useSession } from "@/lib/hooks/useAuth";
import { useSubmitContent, useCreatorSubmissions } from "@/lib/hooks/useCreator";
import { toast } from "sonner";
import {
  ArrowLeft,
  MessageSquare,
  Upload,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Paperclip,
  X,
  Plus,
  Edit3,
  Loader2,
  Camera,
  Video,
  FileText,
  Star,
  Share2
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: string;
  type: string;
  platform: string;
  quantity?: string | number;
}

interface Submission {
  id: number;
  title?: string;
  name?: string;
  description: string;
  tags: string[];
  thumbnail?: string;
  type?: string;
  uploadedAt: string;
  file?: File;
  status?: string;
}

interface Project {
  id: string | number;
  title: string;
  brand: string;
  compensation: string;
  deadline: string;
  status: string;
  progress: number;
  image: string;
  submissionCount: number;
  maxSubmissions: number;
  tasks?: Task[];
  lastMessage?: string;
  originalCampaign?: any; // Allow original campaign data
}

interface ActiveProjectDetailsProps {
  project: Project;
  onBack: () => void;
}

const ActiveProjectDetails = ({ project, onBack }: ActiveProjectDetailsProps) => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [taskSubmissions, setTaskSubmissions] = useState<{ [key: string]: Submission[] }>({});
  const [editingSubmission, setEditingSubmission] = useState<{ taskId: string, submissionId: number } | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState('');
  const [submittingTask, setSubmittingTask] = useState<string | null>(null);
  const [submittedTasks, setSubmittedTasks] = useState<Set<string>>(new Set());

  // Get campaign ID from original campaign data if available
  const campaignId = project.originalCampaign?.id || (typeof project.id === 'string' ? project.id : '');
  const { messages, isLoading: messagesLoading, sendMessage, uploadingFiles, isSending } = useMessages(campaignId);

  // Submission hooks
  const submitContent = useSubmitContent();
  const { data: submissions = [] } = useCreatorSubmissions(campaignId);

  // Handle deep linking to specific tabs and messages
  useEffect(() => {
    const tab = searchParams?.get('tab');
    const messageId = searchParams?.get('message');

    // Handle tab parameter
    if (tab && ['overview', 'messages', 'submissions'].includes(tab)) {
      setActiveTab(tab);
    }

    // Handle message deep linking
    if (messageId && messages.length > 0) {
      // Find the message in the current messages
      const targetMessage = messages.find(msg => msg.id === messageId);

      if (targetMessage) {
        // Switch to messages tab
        setActiveTab('messages');

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
  }, [messages, searchParams]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending-review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'revision-requested': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'pending-review': return <AlertCircle className="h-4 w-4" />;
      case 'revision-requested': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const mockTasks = [
    {
      id: 1,
      title: "Instagram Post",
      description: "Create 1 Instagram post showcasing the hotel's ocean view",
      deadline: "Jan 23, 2025",
      status: "pending",
      type: "post",
      platform: "Instagram"
    },
    {
      id: 2,
      title: "Instagram Stories",
      description: "Share 3-5 Instagram stories during your stay",
      deadline: "Jan 24, 2025",
      status: "pending",
      type: "story",
      platform: "Instagram"
    },
    {
      id: 3,
      title: "Hotel Review",
      description: "Write a detailed review on TripAdvisor",
      deadline: "Jan 26, 2025",
      status: "pending",
      type: "review",
      platform: "TripAdvisor"
    }
  ];

  // Use provided tasks or fall back to mock data
  const tasks = project.tasks || mockTasks;

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'post': return <Camera className="h-4 w-4" />;
      case 'story': return <Video className="h-4 w-4" />;
      case 'reel': return <Video className="h-4 w-4" />;
      case 'review': return <Star className="h-4 w-4" />;
      case 'blog': return <FileText className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() || attachedFiles.length > 0) {
      await sendMessage(newMessage, attachedFiles);
      setNewMessage('');
      setAttachedFiles([]);
    }
  };

  const handleMessageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleFileUpload = (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newSubmissions = Array.from(files).map(file => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        description: '',
        tags: [],
        status: 'draft',
        uploadedAt: new Date().toISOString()
      }));

      setTaskSubmissions(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), ...newSubmissions]
      }));
    }
  };

  const handleDropFiles = (taskId: string, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const newSubmissions = Array.from(files).map(file => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        description: '',
        tags: [],
        status: 'draft',
        uploadedAt: new Date().toISOString()
      }));
      setTaskSubmissions(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), ...newSubmissions]
      }));
    }
  };

  const handleDragOverUpload = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleSubmitTask = async (taskId: string) => {
    const taskSubmissionsData = taskSubmissions[taskId];
    if (!taskSubmissionsData || taskSubmissionsData.length === 0) {
      toast.error('Please upload at least one file before submitting.');
      return;
    }

    setSubmittingTask(taskId);

    try {
      // Find the task details
      const task = tasks.find(t => t.id.toString() === taskId);

      // Prepare the files and metadata
      const files = taskSubmissionsData.map(sub => sub.file).filter(Boolean) as File[];
      const descriptions: { [key: string]: string } = {};
      const tags: { [key: string]: string[] } = {};

      taskSubmissionsData.forEach((sub) => {
        if (sub.file) {
          descriptions[sub.file.name] = sub.description || '';
          tags[sub.file.name] = sub.tags || [];
        }
      });

      await submitContent.mutateAsync({
        campaignId,
        taskId,
        taskDescription: task?.description || '',
        contentType: task?.type || '',
        socialChannel: task?.platform || '',
        quantity: taskSubmissionsData.length,
        files,
        descriptions,
        tags
      });

      // Mark task as submitted locally
      setSubmittedTasks(prev => new Set([...prev, taskId]));

      // Clear the local submissions for this task
      setTaskSubmissions(prev => ({
        ...prev,
        [taskId]: []
      }));

    } catch (error) {
      console.error('Task submission error:', error);
      // Error is already handled by the hook
    } finally {
      setSubmittingTask(null);
    }
  };

  const removeSubmission = (taskId: string, submissionId: number) => {
    setTaskSubmissions(prev => ({
      ...prev,
      [taskId]: prev[taskId]?.filter(sub => sub.id !== submissionId) || []
    }));
  };

  const startEditingSubmission = (taskId: string, submissionId: number, submission: any) => {
    setEditingSubmission({ taskId, submissionId });
    setEditDescription(submission.description || '');
    setEditTags(submission.tags.join(', '));
  };

  const saveSubmissionEdit = () => {
    if (!editingSubmission) return;

    const { taskId, submissionId } = editingSubmission;
    setTaskSubmissions(prev => ({
      ...prev,
      [taskId]: prev[taskId]?.map(sub =>
        sub.id === submissionId
          ? {
            ...sub,
            description: editDescription,
            tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag)
          }
          : sub
      ) || []
    }));

    setEditingSubmission(null);
    setEditDescription('');
    setEditTags('');
  };

  const cancelSubmissionEdit = () => {
    setEditingSubmission(null);
    setEditDescription('');
    setEditTags('');
  };

  const getTaskStatus = (taskId: string) => {
    // Check if there's a real submission for this task from the API
    // Handle both new ID format (actual content item IDs) and legacy format (indices like "1", "2")
    const realSubmission = submissions.find((sub: any) => {
      // Direct match for new format
      if (sub.taskId === taskId) return true;

      // Legacy support: if taskId is a content item ID, try to match with legacy index
      const taskIndex = tasks.findIndex(t => t.id.toString() === taskId);
      if (taskIndex !== -1 && sub.taskId === (taskIndex + 1).toString()) return true;

      return false;
    });

    if (realSubmission) {
      return realSubmission.status === 'pending' ? 'submitted' : realSubmission.status;
    }

    // Fall back to local state
    if (submittedTasks.has(taskId)) return 'submitted';
    if (submittingTask === taskId) return 'submitting';
    return 'draft';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Active Collabs
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{project.title}</h1>
              <p className="text-lg text-muted-foreground">{project.brand}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(project.status)}>
                {getStatusIcon(project.status)}
                <span className="ml-1">{project.status.replace('-', ' ')}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'messages'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'submissions'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'payment'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Payment
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Project Image */}
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-[2/1] overflow-hidden rounded-lg">
                      <Image
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        width={100}
                        height={100}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Required Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Required Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                              {getTaskIcon(task.type)}
                            </div>
                            <div>
                              <span className="font-medium text-sm">{task.title}</span>
                              <p className="text-xs text-muted-foreground">{task.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {task.platform}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Due {task.deadline}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Collab Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="w-full" />
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Submissions:</span>
                          <span className="ml-2 font-medium">{project.submissionCount}/{project.maxSubmissions}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Deadline:</span>
                          <span className="ml-2 font-medium">{project.deadline}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Latest Updates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Latest Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-2 border-blue-500 pl-4">
                        <p className="font-medium text-sm">Brand Message</p>
                        <p className="text-muted-foreground text-sm">{project.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'messages' && (
              <Card>
                <CardHeader>
                  <CardTitle>Collab Chat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Messages List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {messagesLoading ? (
                        <div className="flex justify-center items-center h-full">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message: any) => {
                          const isSent = message.sender_id === session?.user?.id;
                          const isHighlighted = highlightedMessageId === message.id;
                          return (
                            <div key={message.id} id={`message-${message.id}`} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] rounded-lg p-3 transition-all duration-300 ${isHighlighted
                                ? 'ring-2 ring-blue-400 ring-opacity-75 shadow-lg'
                                : ''
                                } ${isSent
                                  ? 'bg-primary text-primary-foreground'
                                  : message.is_broadcast
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    : 'bg-muted'
                                }`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium">{message.sender?.name || 'Unknown'}</span>
                                  {message.is_broadcast && (
                                    <Badge variant="outline" className="text-xs">Broadcast</Badge>
                                  )}
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{message.message}</p>

                                {/* Attachments */}
                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {message.attachments.map((attachment: any, idx: number) => (
                                      <a
                                        key={idx}
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-2 p-1 rounded text-xs ${isSent ? 'bg-primary-foreground/20 hover:bg-primary-foreground/30' : 'bg-gray-200 hover:bg-gray-300'
                                          } transition-colors`}
                                      >
                                        {attachment.type.startsWith('image/') ? (
                                          <FileText className="h-3 w-3" />
                                        ) : (
                                          <FileText className="h-3 w-3" />
                                        )}
                                        <span className="truncate">{attachment.name}</span>
                                      </a>
                                    ))}
                                  </div>
                                )}

                                <p className="text-xs opacity-70 mt-1">{new Date(message.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Attached Files Preview */}
                    {attachedFiles.length > 0 && (
                      <div className="px-4 py-2 border-t">
                        <div className="flex gap-2 flex-wrap">
                          {attachedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-100 rounded px-3 py-1">
                              {file.type.startsWith('image/') ? (
                                <Camera className="h-3 w-3" />
                              ) : (
                                <FileText className="h-3 w-3" />
                              )}
                              <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                              <button
                                onClick={() => removeAttachment(index)}
                                className="text-gray-500 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Input */}
                    <div className="flex gap-2 pt-4 border-t">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleMessageFileUpload}
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
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[60px] flex-1"
                        disabled={uploadingFiles || isSending}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        size="sm"
                        disabled={(!newMessage.trim() && attachedFiles.length === 0) || uploadingFiles || isSending}
                      >
                        {uploadingFiles || isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 px-4">
                      Press Enter to send, Shift+Enter for new line. Images and PDFs only (max 10MB).
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-6">
                {tasks.map((task) => {
                  const taskStatus = getTaskStatus(task.id.toString());
                  const isSubmitted = taskStatus === 'submitted';
                  const isSubmitting = taskStatus === 'submitting';
                  const isApproved = taskStatus === 'approved';
                  const isRejected = taskStatus === 'rejected';

                  // Get the actual submission for this task
                  const realSubmission = submissions.find((sub: any) => {
                    if (sub.taskId === task.id.toString()) return true;
                    const taskIndex = tasks.findIndex(t => t.id.toString() === task.id.toString());
                    if (taskIndex !== -1 && sub.taskId === (taskIndex + 1).toString()) return true;
                    return false;
                  });

                  return (
                    <Card key={task.id} className={isApproved ? 'border-green-200 bg-green-50/50' : isRejected ? 'border-red-200 bg-red-50/50' : isSubmitted ? 'border-yellow-200 bg-yellow-50/50' : ''}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{task.title}</CardTitle>
                              {isApproved && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approved
                                </Badge>
                              )}
                              {isRejected && (
                                <Badge className="bg-red-100 text-red-800">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Needs Revision
                                </Badge>
                              )}
                              {isSubmitted && !isApproved && !isRejected && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Under Review
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          </div>
                          <Badge variant="outline" className="text-orange-600">
                            Due {task.deadline}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {(isSubmitted || isApproved || isRejected) && realSubmission ? (
                          <div className="space-y-6">
                            {/* Status Message */}
                            <div className={`text-center py-6 rounded-lg ${isApproved ? 'bg-green-50 border border-green-200' :
                              isRejected ? 'bg-red-50 border border-red-200' :
                                'bg-yellow-50 border border-yellow-200'
                              }`}>
                              {isApproved && (
                                <>
                                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                                  <h3 className="text-lg font-medium text-green-800 mb-2">Task Approved! 🎉</h3>
                                  <p className="text-sm text-green-700">
                                    Congratulations! Your submission has been approved by the brand.
                                  </p>
                                </>
                              )}
                              {isRejected && (
                                <>
                                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                                  <h3 className="text-lg font-medium text-red-800 mb-2">Revision Required</h3>
                                  <p className="text-sm text-red-700 mb-4">
                                    The brand has requested changes to your submission.
                                  </p>
                                  {realSubmission.rejectionComment && (
                                    <div className="bg-white p-4 rounded-lg border border-red-200 text-left max-w-md mx-auto">
                                      <p className="font-medium text-red-800 mb-2">Brand Feedback:</p>
                                      <p className="text-sm text-red-700">{realSubmission.rejectionComment}</p>
                                    </div>
                                  )}
                                </>
                              )}
                              {isSubmitted && !isApproved && !isRejected && (
                                <>
                                  <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Under Review</h3>
                                  <p className="text-sm text-yellow-700">
                                    Your submission is being reviewed by the brand. You&apos;ll be notified once they provide feedback.
                                  </p>
                                </>
                              )}
                            </div>

                            {/* Show submitted content */}
                            {realSubmission.assets && (
                              <div className="bg-white rounded-lg p-4 border">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-sm">Your Submission</h4>
                                  <Badge variant="outline" className={
                                    isApproved ? 'text-green-700 border-green-300' :
                                      isRejected ? 'text-red-700 border-red-300' :
                                        'text-yellow-700 border-yellow-300'
                                  }>
                                    {realSubmission.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {realSubmission.assets.map((asset: any) => (
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
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                              <Video className="h-6 w-6 text-white" />
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
                                      <p className="text-xs text-gray-600 mt-1 truncate">{asset.title}</p>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-3 text-left">
                                  <p className="text-xs text-muted-foreground">
                                    Submitted on: {realSubmission.submittedDate}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Allow resubmission for rejected tasks */}
                            {isRejected && (
                              <div className="pt-4 border-t">
                                <div className="text-center mb-4">
                                  <p className="text-sm font-medium text-foreground mb-2">Ready to submit a revision?</p>
                                  <p className="text-xs text-muted-foreground">Upload new files below to replace your previous submission</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}

                        {/* Upload Section - Show for draft tasks or rejected tasks needing revision */}
                        {((!isSubmitted && !isApproved) || isRejected) && (
                          <div className="space-y-6">
                            {/* Upload Section */}
                            <div
                              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center"
                              onDrop={(e) => handleDropFiles(task.id.toString(), e)}
                              onDragOver={handleDragOverUpload}
                            >
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm font-medium mb-2">Upload content for this task</p>
                              <p className="text-xs text-muted-foreground mb-4">
                                Upload your files first, then add descriptions and tags
                              </p>

                              <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={(e) => handleFileUpload(task.id.toString(), e)}
                                className="hidden"
                                id={`file-upload-${task.id}`}
                              />
                              <label
                                htmlFor={`file-upload-${task.id}`}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Choose Files
                              </label>
                            </div>

                            {/* Uploaded Content */}
                            {taskSubmissions[task.id]?.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="font-medium text-sm text-foreground">Uploaded Content</h4>
                                <div className="space-y-3">
                                  {taskSubmissions[task.id].map((submission) => (
                                    <div key={submission.id} className="border rounded-lg p-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                          <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                          <div>
                                            <p className="text-sm font-medium">{submission.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              Uploaded {new Date(submission.uploadedAt).toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => startEditingSubmission(task.id.toString(), submission.id, submission)}
                                          >
                                            <Edit3 className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeSubmission(task.id.toString(), submission.id)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>

                                      {editingSubmission?.taskId === task.id.toString() &&
                                        editingSubmission?.submissionId === submission.id ? (
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-sm font-medium text-foreground">Description</label>
                                            <Textarea
                                              placeholder="Describe your content..."
                                              value={editDescription}
                                              onChange={(e) => setEditDescription(e.target.value)}
                                              className="mt-1"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-foreground">Tags</label>
                                            <Input
                                              placeholder="Enter tags separated by commas"
                                              value={editTags}
                                              onChange={(e) => setEditTags(e.target.value)}
                                              className="mt-1"
                                            />
                                          </div>
                                          <div className="flex gap-2">
                                            <Button size="sm" variant="default" className="bg-black" onClick={saveSubmissionEdit}>
                                              Save
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={cancelSubmissionEdit}>
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {submission.description && (
                                            <div>
                                              <p className="text-xs font-medium text-muted-foreground">Description:</p>
                                              <p className="text-sm">{submission.description}</p>
                                            </div>
                                          )}
                                          {submission.tags.length > 0 && (
                                            <div>
                                              <p className="text-xs font-medium text-muted-foreground mb-1">Tags:</p>
                                              <div className="flex gap-1 flex-wrap">
                                                {submission.tags.map((tag: string, index: number) => (
                                                  <Badge key={index} variant="secondary" className="text-xs">
                                                    {tag}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {!submission.description && submission.tags.length === 0 && (
                                            <p className="text-xs text-muted-foreground italic">
                                              Click the edit button to add description and tags
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Submit Task Button */}
                                <div className="flex justify-end pt-4 border-t">
                                  <Button
                                    onClick={() => handleSubmitTask(task.id.toString())}
                                    disabled={isSubmitting}
                                    className="min-w-[140px] bg-black"
                                  >
                                    {isSubmitting ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {isRejected ? 'Resubmitting...' : 'Submitting...'}
                                      </>
                                    ) : (
                                      isRejected ? 'Submit Revision' : 'Submit Task for Review'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {activeTab === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Total Compensation</p>
                        <p className="text-sm text-muted-foreground">Payment will be released upon completion</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{project.compensation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Collab Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Compensation</span>
                    <p className="text-muted-foreground">{project.compensation}</p>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Deadline</span>
                    <p className="text-muted-foreground">{project.deadline}</p>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Status</span>
                    <p className="text-muted-foreground">{project.status.replace('-', ' ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveProjectDetails;
