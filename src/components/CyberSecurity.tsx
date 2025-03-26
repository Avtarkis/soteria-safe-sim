
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Shield, Lock, Scan, CheckCircle2, XCircle, AlertTriangle, Server, Database, RefreshCw, Laptop, Smartphone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const CyberSecurity = () => {
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<{
    vulnerabilities: number;
    dataLeaks: number;
    suspiciousActivities: number;
    secureItems: number;
  }>({ vulnerabilities: 0, dataLeaks: 0, suspiciousActivities: 0, secureItems: 0 });
  
  const startScan = () => {
    setScanning(true);
    setScanComplete(false);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setScanComplete(true);
            setScanning(false);
            setScanResults({
              vulnerabilities: 2,
              dataLeaks: 1,
              suspiciousActivities: 0,
              secureItems: 5
            });
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 150);
  };

  useEffect(() => {
    return () => {
      // Cleanup any intervals if component unmounts during scan
      const allIntervals = window.setInterval(() => {}, 0);
      for (let i = 0; i < allIntervals; i++) {
        window.clearInterval(i);
      }
    };
  }, []);

  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Cybersecurity Protection</h1>
        <p className="text-muted-foreground">
          Comprehensive protection against cyber threats with real-time monitoring.
        </p>
      </div>

      {/* Main security card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Device Security Scan</CardTitle>
              <CardDescription>Check for vulnerabilities and threats on your device</CardDescription>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Scan className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {scanning ? (
            <div className="space-y-4">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Scanning your system...</span>
                <span className="font-medium">{scanProgress}%</span>
              </div>
              <div className="pt-2">
                <div className="text-xs text-muted-foreground animate-pulse">
                  {scanProgress < 30 && "Initializing scan..."}
                  {scanProgress >= 30 && scanProgress < 60 && "Checking for vulnerabilities..."}
                  {scanProgress >= 60 && scanProgress < 90 && "Scanning for suspicious activities..."}
                  {scanProgress >= 90 && "Finalizing results..."}
                </div>
              </div>
            </div>
          ) : scanComplete ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Vulnerabilities', value: scanResults.vulnerabilities, icon: AlertTriangle, color: scanResults.vulnerabilities > 0 ? 'text-threat-high' : 'text-green-500' },
                  { label: 'Data Leaks', value: scanResults.dataLeaks, icon: Database, color: scanResults.dataLeaks > 0 ? 'text-threat-medium' : 'text-green-500' },
                  { label: 'Suspicious Activities', value: scanResults.suspiciousActivities, icon: Server, color: scanResults.suspiciousActivities > 0 ? 'text-threat-low' : 'text-green-500' },
                  { label: 'Secure Items', value: scanResults.secureItems, icon: CheckCircle2, color: 'text-green-500' },
                ].map((item, index) => (
                  <Card key={index} className="bg-secondary/50 border-none">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <item.icon className={cn("h-6 w-6 mb-2", item.color)} />
                      <span className="text-2xl font-bold">{item.value}</span>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {(scanResults.vulnerabilities > 0 || scanResults.dataLeaks > 0) && (
                <div className="bg-threat-high/10 border border-threat-high/20 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-threat-high flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-threat-high mb-1">Security Issues Detected</h4>
                      <ul className="text-sm space-y-1 list-disc pl-4">
                        {scanResults.vulnerabilities > 0 && (
                          <li>Outdated software with known vulnerabilities</li>
                        )}
                        {scanResults.dataLeaks > 0 && (
                          <li>Your email was found in a recent data breach</li>
                        )}
                      </ul>
                      <Button className="mt-3" size="sm">Fix Issues</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-xl font-medium mb-2">Scan Your Device</h3>
              <p className="text-muted-foreground mb-4">
                Perform a comprehensive scan to detect vulnerabilities, malware, and security issues.
              </p>
              <Button onClick={startScan} className="px-8">Start Scan</Button>
            </div>
          )}
        </CardContent>
        {scanComplete && (
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Last scan: Just now
            </div>
            <Button variant="outline" size="sm" onClick={startScan} className="gap-1">
              <RefreshCw className="h-4 w-4" />
              <span>Scan Again</span>
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Protected devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Protected Devices</CardTitle>
            <CardDescription>Devices currently protected by Soteria</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { name: 'MacBook Pro', type: 'laptop', lastScan: '2 hours ago', status: 'secure' },
                { name: 'iPhone 13', type: 'phone', lastScan: '5 hours ago', status: 'secure' },
                { name: 'iPad Mini', type: 'tablet', lastScan: '1 day ago', status: 'vulnerable' },
              ].map((device, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 bg-secondary/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    {device.type === 'laptop' ? (
                      <Laptop className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{device.name}</p>
                      <p className="text-xs text-muted-foreground">Last scan: {device.lastScan}</p>
                    </div>
                  </div>
                  {device.status === 'secure' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-threat-medium" />
                  )}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-4 text-sm">
              Add New Device
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dark Web Monitoring</CardTitle>
            <CardDescription>Monitoring your data for exposure in data breaches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-threat-high/10 p-3 rounded-lg">
                <XCircle className="h-5 w-5 text-threat-high mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email found in data breach</p>
                  <p className="text-xs text-muted-foreground mb-2">Your email was found in the "SocialMedia123" breach from June 2023.</p>
                  <Button size="sm">Take Action</Button>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-green-500/10 p-3 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Password not compromised</p>
                  <p className="text-xs text-muted-foreground">Your current passwords are secure and haven't been found in any data breaches.</p>
                </div>
              </div>
              
              <div className="bg-secondary/40 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium">Monitoring Status</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">Active</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Email Addresses</span>
                    <span className="font-medium">1 of 3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credit Cards</span>
                    <span className="font-medium">0 of 2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Social Security</span>
                    <span className="font-medium text-threat-medium">Upgrade</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional tools */}
      <h2 className="text-xl font-semibold mb-4">Security Tools</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { name: 'Password Vault', icon: Lock, description: 'Securely store passwords' },
          { name: 'VPN Service', icon: Globe, description: 'Encrypt your connection' },
          { name: 'Anti-Phishing', icon: Shield, description: 'Block dangerous sites' },
          { name: 'Secure Erase', icon: XCircle, description: 'Remove sensitive data' },
          { name: 'Privacy Guard', icon: Scan, description: 'Control app permissions' },
          { name: 'Backup & Restore', icon: RefreshCw, description: 'Secure cloud backup' },
        ].map((tool, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer" variant="outline">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <tool.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-sm mb-1">{tool.name}</h3>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CyberSecurity;
