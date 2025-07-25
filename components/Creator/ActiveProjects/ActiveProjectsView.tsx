
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Image from "next/image";

interface ActiveProject {
  id: number | string;
  title: string;
  brand: string;
  compensation: string;
  deadline: string;
  status: 'in-progress' | 'pending-review' | 'revision-requested' | 'completed';
  progress: number;
  image: string;
  submissionCount: number;
  maxSubmissions: number;
  budget?: string;
}

interface ActiveProjectsViewProps {
  onProjectClick: (project: ActiveProject) => void;
  projects?: ActiveProject[];
}

const ActiveProjectsView = ({ onProjectClick, projects }: ActiveProjectsViewProps) => {
  const mockActiveProjects: ActiveProject[] = [
    {
      id: 1,
      title: "Luxury Beach Resort Content",
      brand: "Paradise Hotels",
      compensation: "$500 + 3 night stay",
      deadline: "Jan 25, 2025",
      status: "in-progress",
      progress: 60,
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop",
      submissionCount: 2,
      maxSubmissions: 5
    },
    {
      id: 2,
      title: "Adventure Gear Testing",
      brand: "Mountain Explorer",
      compensation: "$300 + Product",
      deadline: "Feb 5, 2025",
      status: "pending-review",
      progress: 80,
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=200&fit=crop",
      submissionCount: 4,
      maxSubmissions: 4
    },
    {
      id: 3,
      title: "Vegan Restaurant Review",
      brand: "Green Eats",
      compensation: "$150",
      deadline: "Jan 30, 2025",
      status: "revision-requested",
      progress: 40,
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=200&fit=crop",
      submissionCount: 1,
      maxSubmissions: 3
    }
  ];

  // Use provided projects or fall back to mock data
  const activeProjects = projects || mockActiveProjects;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending-review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'revision-requested': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'pending-review': return <AlertCircle className="h-4 w-4" />;
      case 'revision-requested': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Active Collabs</h2>
        <Badge variant="secondary">
          {activeProjects.length} Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-all cursor-pointer border-border" onClick={() => onProjectClick(project)}>
            <div className="flex">
              <div className="w-48 flex-shrink-0">
                <div className="aspect-[4/3] overflow-hidden rounded-l-lg">
                  <Image
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                  />
                </div>
              </div>

              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground font-medium">{project.brand}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{project.status.replace('-', ' ')}</span>
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">{project?.budget ? project?.budget + ' + ' + project?.compensation : project?.compensation}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Deadline: {project.deadline}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Submissions: {project.submissionCount}/{project.maxSubmissions}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {activeProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No active collabs</p>
            <p className="text-sm">Your accepted collabs will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveProjectsView;
