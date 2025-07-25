
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText,
  UserCheck,
  MessageSquare,
  Upload,
  CreditCard
} from "lucide-react";
import ApplicantsTable from "./ApplicantsTable";
import CampaignChat from "./CampaignChat";
import SubmissionsView from "./SubmissionsView";
import PaymentManagement from "./PaymentManagement";
import CampaignHeader from "./CampaignDetails/CampaignHeader";
import CampaignOverview from "./CampaignDetails/CampaignOverview";
import CampaignStats from "./CampaignDetails/CampaignStats";

interface CampaignDetailsProps {
  campaign: any;
  onBack: () => void;
  onEdit: () => void;
}

const CampaignDetails = ({ campaign, onBack, onEdit }: CampaignDetailsProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignHeader campaign={campaign} onBack={onBack} onEdit={onEdit} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="details" className="w-full">
          {/* Enhanced Tab Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
            <TabsList className="grid w-full grid-cols-5 h-auto p-2 bg-gray-50 rounded-lg">
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-100"
              >
                <FileText className="h-5 w-5" />
                <span className="hidden sm:inline">Campaign Details</span>
                <span className="sm:hidden">Details</span>
              </TabsTrigger>
              <TabsTrigger 
                value="applicants" 
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-100"
              >
                <UserCheck className="h-5 w-5" />
                <span className="hidden sm:inline">Creators</span>
                <span className="sm:hidden">Creators</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-100"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="hidden sm:inline">Chat</span>
                <span className="sm:hidden">Chat</span>
              </TabsTrigger>
              <TabsTrigger 
                value="submissions" 
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-100"
              >
                <Upload className="h-5 w-5" />
                <span className="hidden sm:inline">Submissions</span>
                <span className="sm:hidden">Submissions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="payment" 
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 rounded-md data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 data-[state=inactive]:hover:bg-gray-100"
              >
                <CreditCard className="h-5 w-5" />
                <span className="hidden sm:inline">Payment</span>
                <span className="sm:hidden">Payment</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="details" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <CampaignOverview campaign={campaign} />
              </div>

              {/* Sidebar */}
              <div>
                <CampaignStats campaign={campaign} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applicants" className="mt-0">
            <ApplicantsTable campaignId={campaign.id} />
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <CampaignChat campaignId={campaign.id} />
          </TabsContent>

          <TabsContent value="submissions" className="mt-0">
            <SubmissionsView campaignId={campaign.id} />
          </TabsContent>

          <TabsContent value="payment" className="mt-0">
            <PaymentManagement campaignId={campaign.id} campaign={campaign} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CampaignDetails;
