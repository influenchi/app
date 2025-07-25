
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DashboardNavigation from "./DashboardNavigation";

interface DashboardHeaderProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onCreateCampaign: () => void;
}

const DashboardHeader = ({ activeView, onViewChange, onCreateCampaign }: DashboardHeaderProps) => {
  return (
    <div className="bg-card border-b border-border/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Brand Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your campaigns and creator relationships</p>
            </div>
            
            <DashboardNavigation 
              activeView={activeView} 
              onViewChange={onViewChange}
            />
          </div>
          
          <Button 
            onClick={onCreateCampaign}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
