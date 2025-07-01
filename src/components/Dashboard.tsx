
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  MapPin,
  AlertTriangle,
  Shield,
  Users,
  BarChart3,
  Globe,
  Lock,
  Zap,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  User,
  SearchCheck,
  Route as RouteIcon,
  LucideIcon
} from 'lucide-react';

console.log('Dashboard component: Loading Dashboard.tsx');

// Icon wrapper component with proper styling
const IconCircle = ({ className, icon: Icon, bg, border, iconColor }: {
  className?: string;
  icon: LucideIcon;
  bg: string;
  border: string;
  iconColor: string;
}) => {
  console.log('Dashboard component: Rendering IconCircle with', { bg, border, iconColor });
  return (
    <div
      className={cn(
        "w-12 h-12 flex items-center justify-center rounded-full shadow-lg border-2 flex-shrink-0",
        border,
        bg,
        className
      )}
    >
      <Icon size={24} className={iconColor} />
    </div>
  );
};

// Dashboard header component
const DashboardHeader = () => {
  console.log('Dashboard component: Rendering DashboardHeader');
  return (
    <div className="pb-6">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3 mb-2">
        <Zap className="text-blue-500 h-8 w-8 animate-pulse" />
        Dashboard
      </h1>
      <p className="text-lg text-muted-foreground">
        Your safety command center. Get real-time insights and take action.
      </p>
    </div>
  );
};

// Main feature cards
const MainFeatureCards = () => {
  console.log('Dashboard component: Rendering MainFeatureCards');
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <IconCircle
            icon={Shield}
            bg="bg-blue-600"
            border="border-blue-400"
            iconColor="text-white"
          />
          <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            Emergency
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
            Access emergency features and SOS functionality.
          </p>
          <Button size="sm" variant="default" asChild className="w-full">
            <Link to="/emergency">
              Emergency Mode <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <IconCircle
            icon={Globe}
            bg="bg-green-600"
            border="border-green-400"
            iconColor="text-white"
          />
          <CardTitle className="text-lg font-semibold text-green-900 dark:text-green-100">
            Travel
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-green-700 dark:text-green-300 text-sm mb-4">
            Plan safe travel routes and review travel advisories.
          </p>
          <Button size="sm" variant="default" asChild className="w-full">
            <Link to="/travel">
              Travel Safety <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <IconCircle
            icon={Lock}
            bg="bg-purple-600"
            border="border-purple-400"
            iconColor="text-white"
          />
          <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100">
            Cyber Security
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-purple-700 dark:text-purple-300 text-sm mb-4">
            Check cybersecurity threats and protect your digital assets.
          </p>
          <Button size="sm" variant="default" asChild className="w-full">
            <Link to="/cyber">
              Cyber Security <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Quick action card component
const QuickActionCard = ({ title, description, icon: Icon, bgColor, onClick, buttonText }: {
  title: string;
  description: string;
  icon: LucideIcon;
  bgColor: string;
  onClick: () => void;
  buttonText: string;
}) => {
  console.log('Dashboard component: Rendering QuickActionCard for', title);
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-border">
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <IconCircle 
          icon={Icon} 
          bg={bgColor} 
          border="border-gray-300 dark:border-gray-600" 
          iconColor="text-white" 
        />
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-3">{description}</p>
        <Button size="sm" variant="outline" className="w-full" onClick={onClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

// Quick actions grid
const QuickActionsGrid = ({ navigate, toast }: { navigate: any, toast: any }) => {
  console.log('Dashboard component: Rendering QuickActionsGrid');
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <QuickActionCard
        title="Family Safety"
        description="Monitor and manage your family's safety status."
        icon={Users}
        bgColor="bg-pink-600"
        buttonText="Family Center"
        onClick={() => {
          console.log('Dashboard component: Family Center clicked');
          navigate('/family');
        }}
      />
      <QuickActionCard
        title="Threat Map"
        description="Visualize real-time threats on an interactive map."
        icon={MapPin}
        bgColor="bg-blue-600"
        buttonText="View Map"
        onClick={() => {
          console.log('Dashboard component: Threat Map clicked');
          navigate('/map');
        }}
      />
      <QuickActionCard
        title="AI Protection"
        description="Activate 24/7 AI-driven security monitoring."
        icon={ShieldCheck}
        bgColor="bg-yellow-600"
        buttonText="Activate AI"
        onClick={() => {
          console.log('Dashboard component: AI Protection clicked');
          toast({ title: "AI Protection", description: "AI Security Activated!" });
        }}
      />
    </div>
  );
};

const Dashboard = () => {
  console.log('Dashboard component: Starting Dashboard render');
  
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log('Dashboard component: Hooks initialized', { navigate: !!navigate, toast: !!toast });

  try {
    console.log('Dashboard component: Rendering main JSX');
    return (
      <div className="space-y-8 pb-10 animate-fade-in min-h-screen bg-background p-6">
        <DashboardHeader />
        <MainFeatureCards />
        <QuickActionsGrid navigate={navigate} toast={toast} />
      </div>
    );
  } catch (error) {
    console.error('Dashboard component: Error during render', error);
    return (
      <div className="p-6">
        <h1>Dashboard Error</h1>
        <p>Something went wrong rendering the dashboard. Check console for details.</p>
        <pre>{String(error)}</pre>
      </div>
    );
  }
};

console.log('Dashboard component: Dashboard component defined, exporting');

export default Dashboard;
