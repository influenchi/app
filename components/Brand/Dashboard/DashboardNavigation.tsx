
import { Button } from "@/components/ui/button";

interface DashboardNavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const DashboardNavigation = ({ activeView, onViewChange }: DashboardNavigationProps) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'campaigns', label: 'Campaigns' },
    { id: 'assets', label: 'Asset Library' }
  ];

  return (
    <nav className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
      {navItems.map((item) => (
        <Button 
          key={item.id}
          variant={activeView === item.id ? "default" : "ghost"}
          onClick={() => onViewChange(item.id)}
          size="sm"
          className={`transition-all ${
            activeView === item.id 
              ? "shadow-sm" 
              : "hover:bg-background/80"
          }`}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  );
};

export default DashboardNavigation;
