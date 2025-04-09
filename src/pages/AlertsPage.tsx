
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { AlertTriangle, Bell, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AlertsPage = () => {
  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
        <p className="text-muted-foreground">
          View and manage your safety alerts and notifications.
        </p>
      </div>

      <Tabs defaultValue="recent">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Recent Alerts</TabsTrigger>
          <TabsTrigger value="settings">Alert Settings</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          <Card className="border-threat-high/30">
            <CardHeader className="flex flex-row items-center gap-3 py-3">
              <AlertTriangle className="h-5 w-5 text-threat-high" />
              <div>
                <CardTitle className="text-base">Low Body Temperature Detected</CardTitle>
                <p className="text-xs text-muted-foreground">Just now</p>
              </div>
              <div className="ml-auto bg-threat-high/10 text-threat-high text-xs font-medium px-2 py-1 rounded-full">
                Critical
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">Low body temperature detected (94.7°F). This could indicate hypothermia or another medical emergency.</p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm">Dismiss</Button>
                <Button size="sm">View Details</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 py-3">
              <Bell className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle className="text-base">Travel Advisory Update</CardTitle>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <div className="ml-auto bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full dark:bg-amber-900/30 dark:text-amber-500">
                Warning
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">New travel advisory issued for your upcoming destination (Paris, France). Level 2: Exercise Increased Caution due to terrorism.</p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm">Dismiss</Button>
                <Button size="sm">View Advisory</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 py-3">
              <Info className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-base">Family Check-in Reminder</CardTitle>
                <p className="text-xs text-muted-foreground">Yesterday</p>
              </div>
              <div className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-500">
                Info
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">Sarah hasn't checked in for 24 hours. Consider requesting a check-in to verify her status.</p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm">Dismiss</Button>
                <Button size="sm">Request Check-in</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Critical Safety Alerts</h3>
                    <p className="text-sm text-muted-foreground">Life-threatening emergencies and immediate dangers</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="critical"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Travel Advisories</h3>
                    <p className="text-sm text-muted-foreground">Updates on safety conditions at your destinations</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="travel"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Family Activity</h3>
                    <p className="text-sm text-muted-foreground">Location changes and safety status of family members</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="family"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Cyber Threats</h3>
                    <p className="text-sm text-muted-foreground">Detected cyber security risks and data breaches</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="cyber"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Alert Delivery Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="push"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Alerts</h3>
                    <p className="text-sm text-muted-foreground">Send alerts to your email address</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="email"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Messages</h3>
                    <p className="text-sm text-muted-foreground">Send text alerts to your phone</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="sms"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Emergency Contact Notifications</h3>
                    <p className="text-sm text-muted-foreground">Alert your emergency contacts for critical situations</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="emergency-contacts"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-4 w-4 text-threat-high" />
                    <span className="font-medium">Low Body Temperature Detected</span>
                    <span className="ml-auto text-xs text-muted-foreground">April 9, 2025 • 2:30 AM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Low body temperature detected (94.7°F). This could indicate hypothermia or another medical emergency.</p>
                </div>
                
                <div className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Travel Advisory Update</span>
                    <span className="ml-auto text-xs text-muted-foreground">April 8, 2025 • 10:15 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">New travel advisory issued for your upcoming destination (Paris, France). Level 2: Exercise Increased Caution due to terrorism.</p>
                </div>
                
                <div className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Family Check-in Reminder</span>
                    <span className="ml-auto text-xs text-muted-foreground">April 8, 2025 • 3:42 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Sarah hasn't checked in for 24 hours. Consider requesting a check-in to verify her status.</p>
                </div>
                
                <div className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">Unusual Activity Detected</span>
                    <span className="ml-auto text-xs text-muted-foreground">April 7, 2025 • 9:17 AM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Unusual login activity detected on your account from an unrecognized device in Boston, MA.</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-4 w-4 text-threat-high" />
                    <span className="font-medium">Earthquake Alert</span>
                    <span className="ml-auto text-xs text-muted-foreground">April 5, 2025 • 6:03 PM</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Magnitude 4.2 earthquake detected near your location. No immediate danger reported.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsPage;
