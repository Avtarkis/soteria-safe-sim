import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const CyberSecurity = () => {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firewallActive, setFirewallActive] = useState(true);
  const [realtimeProtection, setRealtimeProtection] = useState(false);
  const [quarantineFiles, setQuarantineFiles] = useState([
    { id: 1, name: 'Trojan.exe', type: 'Malware', date: '2024-03-15' },
    { id: 2, name: 'Keylogger.dll', type: 'Spyware', date: '2024-03-10' },
  ]);

  const handleScan = () => {
    setLoading(true);
    // Simulate a scan
    setTimeout(() => {
      setLoading(false);
      setScanned(true);
      toast({
        title: "Scan Complete",
        description: "No critical security issues found",
      });
    }, 3000);
  };

  const toggleFirewall = () => {
    setFirewallActive(!firewallActive);
    toast({
      title: "Firewall Status Changed",
      description: firewallActive ? "Firewall disabled" : "Firewall enabled",
    });
  };

  const toggleRealtimeProtection = () => {
    setRealtimeProtection(!realtimeProtection);
    toast({
      title: "Realtime Protection Changed",
      description: realtimeProtection ? "Realtime protection disabled" : "Realtime protection enabled",
    });
  };

  const removeQuarantineFile = (id: number) => {
    setQuarantineFiles(quarantineFiles.filter(file => file.id !== id));
    toast({
      title: "File Removed",
      description: "Selected file removed from quarantine",
    });
  };

  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Cyber Security</h1>
        <p className="text-muted-foreground">
          Monitor and manage your device's security settings.
        </p>
      </div>

      <Tabs defaultValue="scan" className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="scan">Scan</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="quarantine">Quarantine</TabsTrigger>
        </TabsList>
        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Security Scan</span>
              </CardTitle>
              <CardDescription>
                Check your device for potential threats and vulnerabilities.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="text-center">
                {scanned ? (
                  <>
                    <Check className="mx-auto h-12 w-12 text-green-500 mb-3" />
                    <p className="text-lg font-medium">No threats found!</p>
                    <p className="text-muted-foreground">Your device is secure.</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-3" />
                    <p className="text-lg font-medium">Run a scan to check for threats.</p>
                    <p className="text-muted-foreground">Keep your device protected.</p>
                  </>
                )}
              </div>
              <Button 
                onClick={handleScan} 
                className="w-full mt-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  "Start Scan"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Manage your device's security configurations.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <span>Firewall</span>
                <Button variant="outline" size="sm" onClick={toggleFirewall}>
                  {firewallActive ? "Disable" : "Enable"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span>Realtime Protection</span>
                <Button variant="outline" size="sm" onClick={toggleRealtimeProtection}>
                  {realtimeProtection ? "Disable" : "Enable"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quarantine" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span>Quarantine</span>
              </CardTitle>
              <CardDescription>
                Review and manage quarantined files.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {quarantineFiles.length === 0 ? (
                <div className="text-center">
                  <p className="text-muted-foreground">No files in quarantine.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {quarantineFiles.map(file => (
                    <div key={file.id} className="py-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.type} - {file.date}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeQuarantineFile(file.id)}>
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-muted-foreground text-sm">
                Quarantined files are isolated and cannot harm your system.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CyberSecurity;
