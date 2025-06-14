
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import useAIMonitoring from '@/hooks/use-ai-monitoring';
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
  Route as RouteIcon
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// 3D/gradient/flat iconic SVG backgrounds for cards
const IconCircle = ({ className, icon: Icon, bg, border, iconColor }) => (
  <div
    className={cn(
      "w-14 h-14 flex items-center justify-center rounded-full shadow-lg border-2",
      border,
      bg,
      className
    )}
  >
    <Icon size={28} className={iconColor} />
  </div>
);

// HEADLINE component
const DashboardHeader = () => (
  <div className="pb-2 md:pb-4">
    <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-2">
      <Zap className="text-blue-500 h-8 w-8 drop-shadow-md animate-pulse" /> Dashboard
    </h1>
    <p className="text-lg text-muted-foreground mt-2">
      Your safety command center. Get real-time insights and take action.
    </p>
  </div>
);

// DASHBOARD GRID CARDS
const DashboardGridCards = ({ handleRouteClick }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-2 mt-8">
    <Card className="bg-gradient-to-br from-[#212943] to-[#10131c] border-transparent shadow-2xl">
      <CardHeader className="flex items-center gap-3">
        <IconCircle
          icon={Shield}
          bg="bg-blue-900"
          border="border-blue-600"
          iconColor="text-blue-400"
        />
        <CardTitle className="text-lg font-bold flex flex-row gap-2 items-center text-white">
          Emergency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-3">
          Access emergency features and SOS functionality.
        </p>
        <Button size="sm" variant="secondary" asChild>
          <Link to="/emergency">
            Emergency Mode <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-[#233a34] to-[#142919] border-transparent shadow-2xl">
      <CardHeader className="flex items-center gap-3">
        <IconCircle
          icon={Globe}
          bg="bg-green-900"
          border="border-green-600"
          iconColor="text-green-400"
        />
        <CardTitle className="text-lg font-bold flex flex-row gap-2 items-center text-white">
          Travel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-3">
          Plan safe travel routes and review travel advisories.
        </p>
        <Button size="sm" variant="secondary" asChild>
          <Link to="/travel">
            Travel Safety <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-[#272330] to-[#161124] border-transparent shadow-2xl">
      <CardHeader className="flex items-center gap-3">
        <IconCircle
          icon={Lock}
          bg="bg-purple-900"
          border="border-purple-600"
          iconColor="text-purple-400"
        />
        <CardTitle className="text-lg font-bold flex flex-row gap-2 items-center text-white">
          Cyber
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-3">
          Check cybersecurity threats and protect your digital assets.
        </p>
        <Button size="sm" variant="secondary" asChild>
          <Link to="/cyber">
            Cyber Security <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

const QuickActionCard = ({ title, description, icon: Icon, color, onClick, buttonText }) => (
  <Card className="transition transform hover:scale-105 shadow-xl bg-gradient-to-br from-[#20293c] to-[#181b25]">
    <CardHeader className="flex items-center gap-3">
      <IconCircle icon={Icon} bg={color} border="border-white/10" iconColor="text-white" />
      <CardTitle className="text-base font-semibold text-white">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-xs mb-2">{description}</p>
      <Button size="sm" variant="outline" className="w-full" onClick={onClick}>
        {buttonText}
      </Button>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { detections } = useAIMonitoring();

  // Route calculation example action
  const handleRouteClick = (destination: string) => {
    toast({
      title: `Safe Route to ${destination}`,
      description: `Calculating the safest route to your ${destination.toLowerCase()} location...`,
    });
    setTimeout(() => {
      toast({
        title: `Route Found`,
        description: `Redirecting to map view for your ${destination.toLowerCase()}.`,
      });
      navigate(`/map?destination=${destination.toLowerCase()}`);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in min-h-[90vh] bg-gradient-to-br from-[#151928] to-[#080915] px-0 md:px-4">
      <DashboardHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <QuickActionCard
          title="Family Safety"
          description="Monitor and manage your family’s safety status."
          icon={Users}
          color="bg-pink-800"
          buttonText="Family Center"
          onClick={() => navigate('/family')}
        />
        <QuickActionCard
          title="Threat Map"
          description="Visualize real-time threats on an interactive map."
          icon={MapPin}
          color="bg-blue-800"
          buttonText="View Map"
          onClick={() => navigate('/map')}
        />
        <QuickActionCard
          title="AI Protection"
          description="Activate 24/7 AI-driven security monitoring."
          icon={ShieldCheck}
          color="bg-yellow-700"
          buttonText="Activate AI"
          onClick={() => toast({ title: "AI Protection", description: "AI Security Activated!" })}
        />
      </div>

      <DashboardGridCards handleRouteClick={handleRouteClick} />
    </div>
  );
};

export default Dashboard;

