import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, Shield, Scan, Layers, FileText, ServerCrash, Database, Smartphone, Globe, Zap, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Mock threat data
const threatData = [
  { 
    id: 1, 
    type: 'phishing', 
    name: 'Phishing attempt detected', 
    description: 'A suspicious email claiming to be from your bank was blocked.',
    level: 'medium',
    time: '2 hours ago',
    action: 'View Details'
  },
  { 
    id: 2, 
    type: 'malware', 
    name: 'Malware blocked', 
    description: 'Attempted installation of malicious software was prevented.',
    level: 'high',
    time: '1 day ago',
    action: 'View Report'
  },
  { 
    id: 3, 
    type: 'vulnerability', 
    name: 'Software vulnerability', 
    description: 'Your browser needs to be updated to patch security vulnerabilities.',
    level: 'low',
    time: '3 days ago',
    action: 'Update Now'
  },
];

// Mock scan results
const scanResults = {
  lastScan: '2 hours ago',
  threatDetected: 1,
  vulnerabilities: 2,
  scanStatus: 'Secure',
  dataProtection: 'Strong',
  passwordHealth: 'Good'
};

// Threat level styling
const threatLevelStyles = {
  low: "text-threat-low",
  medium: "text-threat-medium",
  high: "text-threat-high"
};

const CyberSecurity = () => {
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('threats');
  
  const startScan = () => {
    setScanning(true);
    setScanComplete(false);
    
    // Simulate scan completion after 3 seconds
    setTimeout(() => {
      setScanning(false);
      setScanComplete(true);
    }, 3000);
  };
  
  return (
    <div className="container pb-10 animate-fade-in">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cybersecurity Protection</h1>
        <p className="text-muted-foreground">
          Monitor your digital security and protect against cyber threats.
        </p>
      </div>
      
      {/* Quick Scan Section */}
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Quick Security Scan</CardTitle>
            <CardDescription>
              Run a scan to check for potential security issues on your device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 bg-secondary/60 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Last scan</h3>
                    <p className="text-sm text-muted-foreground">{scanResults.lastScan}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Threats Detected', value: scanResults.threatDetected, icon: AlertTriangle, color: scanResults.threatDetected > 0 ? 'text-threat-medium' : 'text-green-500' },
                    { label: 'Vulnerabilities', value: scanResults.vulnerabilities, icon: Lock, color: scanResults.vulnerabilities > 0 ? 'text-threat-low' : 'text-green-500' },
                    { label: 'Status', value: scanResults.scanStatus, icon: Shield, color: 'text-green-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-secondary/40 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <item.icon className={cn("h-4 w-4", item.color)} />
                      </div>
                      <div className={cn("font-medium", item.color)}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  isLoading={scanning}
                  loadingText="Scanning..."
                  onClick={startScan}
                  className="w-full gap-2"
                >
                  <Scan className="h-4 w-4" />
                  <span>Run Quick Scan</span>
                </Button>
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="font-medium mb-3">Protection Status</h3>
                
                <div className="space-y-4 flex-1">
                  {[
                    { label: 'Real-time Protection', status: 'Active', icon: Zap, color: 'text-green-500' },
                    { label: 'Data Protection', status: scanResults.dataProtection, icon: Database, color: 'text-green-500' },
                    { label: 'Password Health', status: scanResults.passwordHealth, icon: Lock, color: 'text-green-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="w-8 h-8 bg-secondary/60 rounded-full flex items-center justify-center">
                        <item.icon className={cn("h-4 w-4", item.color)} />
                      </div>
                      <div>
                        <p className="text-sm">{item.label}</p>
                        <p className={cn("text-xs font-medium", item.color)}>{item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {scanComplete && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-green-500">Scan completed!</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All critical systems checked. Your device is protected.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'threats', label: 'Threat Alerts', icon: AlertTriangle },
            { id: 'protection', label: 'Protection Features', icon: Shield },
            { id: 'darkweb', label: 'Dark Web Monitoring', icon: Globe },
            { id: 'devices', label: 'Connected Devices', icon: Smartphone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors",
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active tab content */}
      {activeTab === 'threats' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Recent Threat Alerts</h2>
            <Button variant="outline" size="sm" className="gap-1">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Button>
          </div>
          
          {threatData.map((threat) => (
            <Card key={threat.id} className="animate-fade-in">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      threat.level === 'high' ? "bg-threat-high/10" : 
                      threat.level === 'medium' ? "bg-threat-medium/10" : "bg-threat-low/10"
                    )}>
                      <AlertTriangle className={cn(
                        "h-5 w-5",
                        threatLevelStyles[threat.level]
                      )} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <div className="mb-1 sm:mb-0">
                        <h3 className="font-medium">{threat.name}</h3>
                        <p className="text-xs text-muted-foreground">{threat.time}</p>
                      </div>
                      <div className={cn(
                        "text-xs py-1 px-2 font-medium rounded-full self-start sm:self-auto",
                        threat.level === 'high' ? "bg-threat-high/10 text-threat-high" : 
                        threat.level === 'medium' ? "bg-threat-medium/10 text-threat-medium" : "bg-threat-low/10 text-threat-low"
                      )}>
                        {threat.level.charAt(0).toUpperCase() + threat.level.slice(1)} Risk
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {threat.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        {threat.action}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {activeTab === 'protection' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4">Protection Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                title: "Malware Protection", 
                description: "Real-time scanning of files and applications to detect and block malicious software.",
                icon: Shield,
                status: "Active"
              },
              { 
                title: "Phishing Protection", 
                description: "Analyzes websites and emails to prevent identity theft and fraud attempts.",
                icon: Globe,
                status: "Active"
              },
              { 
                title: "Secure Browsing", 
                description: "Protects your online activity by blocking harmful websites and tracking attempts.",
                icon: Lock,
                status: "Active"
              },
              { 
                title: "Smart Firewall", 
                description: "Prevents unauthorized access and monitors network traffic for suspicious activities.",
                icon: ServerCrash,
                status: "Active"
              }
            ].map((feature, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-4 sm:p-6 flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{feature.title}</h3>
                      <span className="text-xs bg-green-500/10 text-green-500 font-medium py-0.5 px-2 rounded-full">
                        {feature.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'darkweb' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Dark Web Monitoring</h2>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Identity Protection Status</h3>
                  <p className="text-sm text-muted-foreground">
                    We continuously monitor the dark web for any leaked personal information and alert you immediately.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center mb-1">
                    <Shield className="h-5 w-5 text-green-500 mr-2" />
                    <h4 className="font-medium text-green-500">All Clear</h4>
                  </div>
                  <p className="text-sm">No personal information found on the dark web.</p>
                </div>
                
                <div className="p-3 bg-secondary/40 rounded-lg">
                  <h4 className="font-medium mb-2">Monitored Information</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {["Email addresses", "Credit cards", "Phone numbers", "Social Security", "Passwords", "Passport info"].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button className="w-full sm:w-auto">
                <span>Add More Monitoring</span>
              </Button>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <h3 className="font-medium">Monitoring Reports</h3>
            <div className="bg-secondary/40 p-6 rounded-lg text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No alerts or incidents found in the last 30 days.</p>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Connected Devices</h2>
            <Button variant="outline" size="sm">Add Device</Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "My iPhone", type: "Mobile", status: "Protected", lastScan: "2 hours ago", icon: Smartphone },
              { name: "Personal Laptop", type: "Windows PC", status: "Protected", lastScan: "1 day ago", icon: Layers },
              { name: "Work Macbook", type: "macOS", status: "Vulnerable", lastScan: "7 days ago", icon: Layers }
            ].map((device, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-secondary/60 rounded-full flex items-center justify-center">
                      <device.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{device.name}</h3>
                      <p className="text-xs text-muted-foreground">{device.type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status</span>
                      <span className={cn(
                        "text-xs py-0.5 px-2 font-medium rounded-full",
                        device.status === "Protected" 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-threat-medium/10 text-threat-medium"
                      )}>
                        {device.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Last Scan</span>
                      <span className="text-xs text-muted-foreground">{device.lastScan}</span>
                    </div>
                    
                    <Button variant="outline" className="w-full text-xs mt-2">Manage</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CyberSecurity;
