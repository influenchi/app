
import { useState } from "react";
import CreatorSettingsLayout from "./Settings/CreatorSettingsLayout";
import CreatorProfileSettings from "./Settings/CreatorProfileSettings";
import PaymentSettings from "./Settings/PaymentSettings";
import NotificationSettings from "./Settings/NotificationSettings";
import AccountSettings from "./Settings/AccountSettings";

const CreatorSettings = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <CreatorProfileSettings />;
      case 'payment':
        return <PaymentSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'account':
        return <AccountSettings />;
      default:
        return <CreatorProfileSettings />;
    }
  };

  return (
    <CreatorSettingsLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </CreatorSettingsLayout>
  );
};

export default CreatorSettings;
