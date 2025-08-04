
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Images, Calendar, Gift, DollarSign, Wrench, Copy } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType?: string;
  budgetDescription?: string;
  timeline: string;
  status: "active" | "draft" | "completed";
  applicants: number;
  approved: number;
  deliverables: number;
  platforms: string[];
  tags: string[];
  category: string;
  createdAt: string;
  endDate: string;
}

interface RecentCampaignsProps {
  campaigns: Campaign[];
  onCampaignClick: (campaign: Campaign) => void;
}

const RecentCampaigns = ({ campaigns, onCampaignClick }: RecentCampaignsProps) => {
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'active':
        return {
          accent: 'bg-green-500',
          badge: 'bg-green-100 text-green-800 border-green-200',
          gradient: 'hover:from-green-50/30 hover:to-emerald-50/30'
        };
      case 'draft':
        return {
          accent: 'bg-amber-500',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          gradient: 'hover:from-amber-50/30 hover:to-yellow-50/30'
        };
      case 'completed':
        return {
          accent: 'bg-blue-500',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          gradient: 'hover:from-blue-50/30 hover:to-indigo-50/30'
        };
      default:
        return {
          accent: 'bg-gray-500',
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          gradient: 'hover:from-gray-50/30 hover:to-slate-50/30'
        };
    }
  };

  const getBudgetDisplay = (campaign: Campaign) => {
    if (campaign.budgetType === 'product') {
      return {
        icon: <Gift className="h-4 w-4" />,
        amount: campaign.budgetDescription || 'Product Exchange',
        color: 'text-purple-600'
      };
    } else if (campaign.budgetType === 'service') {
      return {
        icon: <Wrench className="h-4 w-4" />,
        amount: campaign.budgetDescription || 'Service Exchange',
        color: 'text-blue-600'
      };
    } else {
      return {
        icon: <DollarSign className="h-4 w-4" />,
        amount: `$${campaign.budget.toLocaleString()}`,
        color: 'text-green-600'
      };
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Campaigns
        </CardTitle>
        <CardDescription>Your latest travel campaign activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.slice(0, 3).map((campaign) => {
            const colors = getStatusColors(campaign.status);
            const budgetInfo = getBudgetDisplay(campaign);
            return (
              <div
                key={campaign.id}
                className={`relative p-6 border rounded-lg cursor-pointer transition-all duration-300 bg-gradient-to-r from-white to-gray-50/50 ${colors.gradient} hover:shadow-lg hover:border-primary/20 group`}
                onClick={() => onCampaignClick(campaign)}
              >
                {/* Colored accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${colors.accent} group-hover:w-2 transition-all`} />

                <div className="flex-1 ml-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{campaign.title}</h3>
                        {campaign.title.includes('(Copy)') && (
                          <Copy className="h-4 w-4 text-amber-500" title="This is a duplicated campaign - edit the title to remove (Copy)" />
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={colors.badge}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold flex items-center gap-2 ${budgetInfo.color}`}>
                        {budgetInfo.icon}
                        <span className="text-sm max-w-32 truncate">{budgetInfo.amount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {campaign.timeline}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 group-hover:text-foreground/80 transition-colors">{campaign.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{campaign.applicants}</span>
                        <span className="text-blue-600">applicants</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-200">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-medium">{campaign.approved}</span>
                        <span className="text-green-600">approved</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        <Images className="h-4 w-4" />
                        <span className="font-medium">{campaign.deliverables}</span>
                        <span className="text-purple-600">assets</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {campaign.platforms.slice(0, 2).map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs bg-background hover:bg-accent">
                          {platform}
                        </Badge>
                      ))}
                      {campaign.platforms.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-background">
                          +{campaign.platforms.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentCampaigns;
