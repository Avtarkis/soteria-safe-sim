import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Check, AlertTriangle, CreditCard, Settings } from 'lucide-react';
import { productionPaymentService, PaymentGateway } from '@/services/ProductionPaymentService';

const ProductionPaymentSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('square');
  const [gateways, setGateways] = useState<Map<string, PaymentGateway>>(new Map());
  const [newGateway, setNewGateway] = useState<Partial<PaymentGateway>>({
    name: '',
    type: 'square',
    apiKey: '',
    environment: 'sandbox',
    enabled: false
  });

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = () => {
    const availableGateways = productionPaymentService.getAvailableGateways();
    const gatewayMap = new Map();
    availableGateways.forEach(gateway => {
      gatewayMap.set(gateway.name, gateway);
    });
    setGateways(gatewayMap);
  };

  const handleSaveGateway = (gatewayName: string) => {
    const gateway = gateways.get(gatewayName);
    if (!gateway) return;

    try {
      productionPaymentService.updateGateway(gatewayName, gateway);
      toast({
        title: "Gateway saved",
        description: `${gateway.type} payment gateway settings have been saved.`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error saving gateway",
        description: "Failed to save payment gateway settings.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleToggleGateway = (gatewayName: string, enabled: boolean) => {
    const gateway = gateways.get(gatewayName);
    if (!gateway) return;

    const updatedGateway = { ...gateway, enabled };
    productionPaymentService.updateGateway(gatewayName, updatedGateway);
    
    setGateways(prev => {
      const newMap = new Map(prev);
      newMap.set(gatewayName, updatedGateway);
      return newMap;
    });

    toast({
      title: enabled ? "Gateway enabled" : "Gateway disabled",
      description: `${gateway.type} payment integration has been ${enabled ? 'enabled' : 'disabled'}.`,
      duration: 3000,
    });
  };

  const handleAddGateway = () => {
    if (!newGateway.name || !newGateway.apiKey) {
      toast({
        title: "Invalid gateway",
        description: "Please provide gateway name and API key.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const gateway: PaymentGateway = {
      name: newGateway.name!,
      type: newGateway.type!,
      apiKey: newGateway.apiKey!,
      secretKey: newGateway.secretKey,
      merchantId: newGateway.merchantId,
      environment: newGateway.environment!,
      enabled: newGateway.enabled!
    };

    productionPaymentService.addGateway(gateway);
    loadGateways();

    setNewGateway({
      name: '',
      type: 'square',
      apiKey: '',
      environment: 'sandbox',
      enabled: false
    });

    toast({
      title: "Gateway added",
      description: `${gateway.type} payment gateway has been added.`,
      duration: 3000,
    });
  };

  const handleUpdateGateway = (gatewayName: string, field: string, value: any) => {
    const gateway = gateways.get(gatewayName);
    if (!gateway) return;

    const updatedGateway = { ...gateway, [field]: value };
    setGateways(prev => {
      const newMap = new Map(prev);
      newMap.set(gatewayName, updatedGateway);
      return newMap;
    });
  };

  const renderGatewaySettings = (gateway: PaymentGateway) => (
    <Card key={gateway.name}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="capitalize">{gateway.type}</CardTitle>
            <CardDescription>{gateway.name}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`${gateway.name}-enabled`}>Enabled</Label>
            <Switch 
              id={`${gateway.name}-enabled`}
              checked={gateway.enabled}
              onCheckedChange={(checked) => handleToggleGateway(gateway.name, checked)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${gateway.name}-api-key`}>API Key</Label>
          <Input
            id={`${gateway.name}-api-key`}
            type="password"
            placeholder="Enter API Key"
            value={gateway.apiKey}
            onChange={(e) => handleUpdateGateway(gateway.name, 'apiKey', e.target.value)}
          />
        </div>
        
        {gateway.type !== 'selar' && (
          <div className="space-y-2">
            <Label htmlFor={`${gateway.name}-secret-key`}>Secret Key</Label>
            <Input
              id={`${gateway.name}-secret-key`}
              type="password"
              placeholder="Enter Secret Key"
              value={gateway.secretKey || ''}
              onChange={(e) => handleUpdateGateway(gateway.name, 'secretKey', e.target.value)}
            />
          </div>
        )}
        
        {(gateway.type === 'square' || gateway.type === 'zenithpay') && (
          <div className="space-y-2">
            <Label htmlFor={`${gateway.name}-merchant-id`}>Merchant ID</Label>
            <Input
              id={`${gateway.name}-merchant-id`}
              type="text"
              placeholder="Enter Merchant ID"
              value={gateway.merchantId || ''}
              onChange={(e) => handleUpdateGateway(gateway.name, 'merchantId', e.target.value)}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor={`${gateway.name}-environment`}>Environment</Label>
          <Select
            value={gateway.environment}
            onValueChange={(value) => handleUpdateGateway(gateway.name, 'environment', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {gateway.environment === 'sandbox' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md flex gap-2 items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              You are in sandbox mode. No real payments will be processed.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => productionPaymentService.removeGateway(gateway.name)}
        >
          Remove
        </Button>
        <Button onClick={() => handleSaveGateway(gateway.name)}>
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Production Payment Settings</h1>
      
      {/* Add New Gateway */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Add New Payment Gateway
          </CardTitle>
          <CardDescription>
            Configure a new payment gateway for processing transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-gateway-name">Gateway Name</Label>
            <Input
              id="new-gateway-name"
              placeholder="My Payment Gateway"
              value={newGateway.name || ''}
              onChange={(e) => setNewGateway(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-gateway-type">Gateway Type</Label>
            <Select
              value={newGateway.type}
              onValueChange={(value) => setNewGateway(prev => ({ ...prev, type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
                <SelectItem value="selar">Selar.co</SelectItem>
                <SelectItem value="zenithpay">ZenithPay</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-gateway-api-key">API Key</Label>
            <Input
              id="new-gateway-api-key"
              type="password"
              placeholder="Enter API Key"
              value={newGateway.apiKey || ''}
              onChange={(e) => setNewGateway(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddGateway}>Add Gateway</Button>
        </CardFooter>
      </Card>
      
      {/* Existing Gateways */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Configured Payment Gateways</h2>
        
        {Array.from(gateways.values()).length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No payment gateways configured yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add your first payment gateway using the form above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from(gateways.values()).map(renderGatewaySettings)}
          </div>
        )}
      </div>
      
      {/* Gateway Status Overview */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Gateway Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from(gateways.values()).map(gateway => (
            <Card key={gateway.name} className={`${gateway.enabled ? 'border-green-500' : 'opacity-60'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium capitalize">{gateway.type}</span>
                </div>
                {gateway.enabled ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-xs">Active</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Disabled</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionPaymentSettings;
