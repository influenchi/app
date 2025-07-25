
// Campaign utility functions
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getDashboardStats = () => {
  return {
    totalCampaigns: 12,
    activeCampaigns: 3,
    totalCreators: 45,
    totalSpent: 24500,
    daysLeftInActiveCampaign: 18,
    completionRate: "89%"
  };
};
