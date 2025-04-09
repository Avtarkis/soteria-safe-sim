
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Lock, Database, Search, Eye, FileWarning } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import CyberSecurityBreaches from '@/components/CyberSecurityBreaches';

const CyberSecurityPage = () => {
  const [scanInProgress, setScanInProgress] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const handleStartScan = () => {
    setScanInProgress(true);
    setTimeout(() => {
      setScanInProgress(false);
      setScanComplete(true);
    }, 3000);
  };

  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Cyber Security</h1>
        <p className="text-muted-foreground">
          Monitor and manage your device's security settings.
        </p>
      </div>

      <Tabs defaultValue="scan">
        <TabsList className="mb-6">
          <TabsTrigger value="scan">Scan</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="quarantine">Quarantine</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Scan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-12">
                  {!scanInProgress && !scanComplete ? (
                    <>
                      <AlertTriangle className="mx-auto h-16 w-16 text-amber-500 mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Run a scan to check for threats.</h2>
                      <p className="text-muted-foreground mb-6">Keep your device protected.</p>
                      <Button onClick={handleStartScan}>Start Scan</Button>
                    </>
                  ) : scanInProgress ? (
                    <>
                      <div className="mx-auto h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Scanning in progress...</h2>
                      <p className="text-muted-foreground">Checking for threats and vulnerabilities.</p>
                    </>
                  ) : (
                    <>
                      <Shield className="mx-auto h-16 w-16 text-green-500 mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Scan complete!</h2>
                      <p className="text-muted-foreground mb-2">No threats detected. Your device is secure.</p>
                      <p className="text-xs text-muted-foreground mb-6">Last scan: Just now</p>
                      <Button onClick={() => setScanComplete(false)}>Run Again</Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Malware Protection</span>
                    </div>
                    <span className="text-green-500 text-sm">Active</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-500" />
                      <span>Data Protection</span>
                    </div>
                    <span className="text-green-500 text-sm">Active</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span>Privacy Shield</span>
                    </div>
                    <span className="text-green-500 text-sm">Active</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileWarning className="h-4 w-4 text-amber-500" />
                      <span>Phishing Protection</span>
                    </div>
                    <span className="text-amber-500 text-sm">Needs Update</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Last Scan Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scanComplete ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Status</span>
                      <span className="text-green-500 text-sm">Clean</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Files Scanned</span>
                      <span className="text-sm">14,352</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Threats Found</span>
                      <span className="text-sm">0</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Time Completed</span>
                      <span className="text-sm">Just now</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No recent scan information available.</p>
                    <p className="text-xs text-muted-foreground mt-2">Run a security scan to check your device.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Real-time Protection</h3>
                    <p className="text-sm text-muted-foreground">Continuously monitor for threats</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="real-time"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Web Protection</h3>
                    <p className="text-sm text-muted-foreground">Block malicious websites and phishing attempts</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="web-protection"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Dark Web Monitoring</h3>
                    <p className="text-sm text-muted-foreground">Alert when your information appears on the dark web</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="dark-web"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">App Scanning</h3>
                    <p className="text-sm text-muted-foreground">Check apps for suspicious behavior</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="app-scanning"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-update Security Definitions</h3>
                    <p className="text-sm text-muted-foreground">Keep threat detection database current</p>
                  </div>
                  <div className="flex items-center h-5">
                    <input
                      id="auto-update"
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
              <CardTitle>Scan Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium mb-2">Frequency</h3>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Never (Manual only)</option>
                  </select>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Time</h3>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option>12:00 AM</option>
                    <option>3:00 AM</option>
                    <option selected>4:00 AM</option>
                    <option>5:00 AM</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Choose a time when you're not likely to be using your device</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Scan Type</h3>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option>Quick Scan</option>
                    <option selected>Full System Scan</option>
                    <option>Custom Scan</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quarantine" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quarantined Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No quarantined items</h2>
                <p className="text-muted-foreground">Your device is clean. No threats have been isolated.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <CyberSecurityBreaches />
      </div>
    </div>
  );
};

export default CyberSecurityPage;
