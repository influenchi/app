
import { useState } from "react";
import BrandSettingsLayout from "./Settings/BrandSettingsLayout";
import BrandProfileSettings from "./Settings/BrandProfileSettings";
import BillingEscrowSettings from "./Settings/BillingEscrowSettings";
import TeamManagementSettings from "./Settings/TeamManagementSettings";
import AccountSettings from "./Settings/AccountSettings";
import NotificationSettings from "./Settings/NotificationSettings";
import SubscriptionSettings from "./Settings/SubscriptionSettings";

const BrandSettings = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'profile':
        return <BrandProfileSettings />;
      case 'account':
        return <AccountSettings />;
      case 'billing':
        return <BillingEscrowSettings />;
      case 'subscription':
        return <SubscriptionSettings />;
      case 'team':
        return <TeamManagementSettings />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <BrandProfileSettings />;
    }
  };

  return (
    <BrandSettingsLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderSettingsContent()}
    </BrandSettingsLayout>
  );
};

export default BrandSettings;
