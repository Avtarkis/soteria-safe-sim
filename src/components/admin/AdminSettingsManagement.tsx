
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Users, Bell, Lock, Settings, FileText } from 'lucide-react';

const AdminSettingsManagement = () => {
  const navigate = useNavigate();
  
  const settingsCategories = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions",
      icon: <Users className="h-5 w-5" />,
      link: "/admin/users"
    },
    {
      title: "Payment Settings",
      description: "Configure payment gateways and subscription plans",
      icon: <CreditCard className="h-5 w-5" />,
      link: "/admin/payment-settings"
    },
    {
      title: "Notification Settings",
      description: "Configure system notifications and alerts",
      icon: <Bell className="h-5 w-5" />,
      link: "#"
    },
    {
      title: "Security Settings",
      description: "Configure authentication and security options",
      icon: <Lock className="h-5 w-5" />,
      link: "#"
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings and defaults",
      icon: <Settings className="h-5 w-5" />,
      link: "#"
    },
    {
      title: "Content Settings",
      description: "Manage content, pages, and blog posts",
      icon: <FileText className="h-5 w-5" />,
      link: "#"
    }
  ];

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Settings Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsCategories.map((category, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                {category.icon}
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(category.link)}
                disabled={category.link === "#"}
              >
                Manage
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminSettingsManagement;
