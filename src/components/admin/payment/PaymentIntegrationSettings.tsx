
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Check, AlertTriangle, CreditCard } from 'lucide-react';

interface PaymentCredentials {
  apiKey: string;
  secretKey?: string;
  publicKey?: string;
  merchantId?: string;
  testMode: boolean;
  isEnabled: boolean;
}

const PaymentIntegrationSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('stripe');
  
  const [stripeCredentials, setStripeCredentials] = useState<PaymentCredentials>({
    apiKey: '',
    secretKey: '',
    publicKey: '',
    testMode: true,
    isEnabled: false
  });
  
  const [flutterwaveCredentials, setFlutterwaveCredentials] = useState<PaymentCredentials>({
    apiKey: '',
    secretKey: '',
    publicKey: '',
    testMode: true,
    isEnabled: false
  });
  
  const [paystackCredentials, setPaystackCredentials] = useState<PaymentCredentials>({
    apiKey: '',
    secretKey: '',
    publicKey: '',
    testMode: true,
    isEnabled: false
  });
  
  const [selarCredentials, setSelarCredentials] = useState<PaymentCredentials>({
    apiKey: '',
    merchantId: '',
    testMode: true,
    isEnabled: false
  });

  const handleSave = (provider: string) => {
    // Here you would save the credentials to your database
    toast({
      title: "Settings saved",
      description: `${provider} payment integration settings have been saved.`,
      duration: 3000,
    });
  };

  const handleToggleProvider = (provider: string, enabled: boolean) => {
    switch(provider) {
      case 'stripe':
        setStripeCredentials({...stripeCredentials, isEnabled: enabled});
        break;
      case 'flutterwave':
        setFlutterwaveCredentials({...flutterwaveCredentials, isEnabled: enabled});
        break;
      case 'paystack':
        setPaystackCredentials({...paystackCredentials, isEnabled: enabled});
        break;
      case 'selar':
        setSelarCredentials({...selarCredentials, isEnabled: enabled});
        break;
    }
    
    toast({
      title: enabled ? "Provider enabled" : "Provider disabled",
      description: `${provider} payment integration has been ${enabled ? 'enabled' : 'disabled'}.`,
      duration: 3000,
    });
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Payment Integration Settings</h1>
      
      <Tabs defaultValue="stripe" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
          <TabsTrigger value="flutterwave">Flutterwave</TabsTrigger>
          <TabsTrigger value="paystack">Paystack</TabsTrigger>
          <TabsTrigger value="selar">Selar.co</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Stripe Integration</CardTitle>
                  <CardDescription>Connect your Stripe account to process payments.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="stripe-enabled">Enabled</Label>
                  <Switch 
                    id="stripe-enabled"
                    checked={stripeCredentials.isEnabled}
                    onCheckedChange={(checked) => handleToggleProvider('Stripe', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-api-key">API Key</Label>
                <Input
                  id="stripe-api-key"
                  type="password"
                  placeholder="sk_live_xxxxxxxxxxxxxxxx"
                  value={stripeCredentials.apiKey}
                  onChange={(e) => setStripeCredentials({...stripeCredentials, apiKey: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-public-key">Public Key</Label>
                <Input
                  id="stripe-public-key"
                  type="text"
                  placeholder="pk_live_xxxxxxxxxxxxxxxx"
                  value={stripeCredentials.publicKey || ''}
                  onChange={(e) => setStripeCredentials({...stripeCredentials, publicKey: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-webhook-secret">Webhook Secret</Label>
                <Input
                  id="stripe-webhook-secret"
                  type="password"
                  placeholder="whsec_xxxxxxxxxxxxxxxx"
                  value={stripeCredentials.secretKey || ''}
                  onChange={(e) => setStripeCredentials({...stripeCredentials, secretKey: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="stripe-test-mode" className="flex-grow">Test Mode</Label>
                <Switch 
                  id="stripe-test-mode"
                  checked={stripeCredentials.testMode}
                  onCheckedChange={(checked) => setStripeCredentials({...stripeCredentials, testMode: checked})}
                />
              </div>
              
              {stripeCredentials.testMode && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md flex gap-2 items-start mt-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    You are in test mode. No real payments will be processed. Use Stripe test card numbers for testing.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => setStripeCredentials({
                apiKey: '',
                secretKey: '',
                publicKey: '',
                testMode: true,
                isEnabled: false
              })}>
                Reset
              </Button>
              <Button onClick={() => handleSave('Stripe')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="flutterwave">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Flutterwave Integration</CardTitle>
                  <CardDescription>Connect your Flutterwave account to process payments.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="flutterwave-enabled">Enabled</Label>
                  <Switch 
                    id="flutterwave-enabled"
                    checked={flutterwaveCredentials.isEnabled}
                    onCheckedChange={(checked) => handleToggleProvider('Flutterwave', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flutterwave-api-key">Secret Key</Label>
                <Input
                  id="flutterwave-api-key"
                  type="password"
                  placeholder="FLWSECK_xxxxxxxx"
                  value={flutterwaveCredentials.apiKey}
                  onChange={(e) => setFlutterwaveCredentials({...flutterwaveCredentials, apiKey: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flutterwave-public-key">Public Key</Label>
                <Input
                  id="flutterwave-public-key"
                  type="text"
                  placeholder="FLWPUBK_xxxxxxxx"
                  value={flutterwaveCredentials.publicKey || ''}
                  onChange={(e) => setFlutterwaveCredentials({...flutterwaveCredentials, publicKey: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="flutterwave-test-mode" className="flex-grow">Test Mode</Label>
                <Switch 
                  id="flutterwave-test-mode"
                  checked={flutterwaveCredentials.testMode}
                  onCheckedChange={(checked) => setFlutterwaveCredentials({...flutterwaveCredentials, testMode: checked})}
                />
              </div>
              
              {flutterwaveCredentials.testMode && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md flex gap-2 items-start mt-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    You are in test mode. No real payments will be processed. Use Flutterwave test cards for testing.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => setFlutterwaveCredentials({
                apiKey: '',
                publicKey: '',
                testMode: true,
                isEnabled: false
              })}>
                Reset
              </Button>
              <Button onClick={() => handleSave('Flutterwave')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="paystack">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Paystack Integration</CardTitle>
                  <CardDescription>Connect your Paystack account to process payments.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="paystack-enabled">Enabled</Label>
                  <Switch 
                    id="paystack-enabled"
                    checked={paystackCredentials.isEnabled}
                    onCheckedChange={(checked) => handleToggleProvider('Paystack', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paystack-secret-key">Secret Key</Label>
                <Input
                  id="paystack-secret-key"
                  type="password"
                  placeholder="sk_live_xxxxxxxxxxxxxxxx"
                  value={paystackCredentials.apiKey}
                  onChange={(e) => setPaystackCredentials({...paystackCredentials, apiKey: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paystack-public-key">Public Key</Label>
                <Input
                  id="paystack-public-key"
                  type="text"
                  placeholder="pk_live_xxxxxxxxxxxxxxxx"
                  value={paystackCredentials.publicKey || ''}
                  onChange={(e) => setPaystackCredentials({...paystackCredentials, publicKey: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="paystack-test-mode" className="flex-grow">Test Mode</Label>
                <Switch 
                  id="paystack-test-mode"
                  checked={paystackCredentials.testMode}
                  onCheckedChange={(checked) => setPaystackCredentials({...paystackCredentials, testMode: checked})}
                />
              </div>
              
              {paystackCredentials.testMode && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md flex gap-2 items-start mt-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    You are in test mode. No real payments will be processed. Use Paystack test cards for testing.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => setPaystackCredentials({
                apiKey: '',
                publicKey: '',
                testMode: true,
                isEnabled: false
              })}>
                Reset
              </Button>
              <Button onClick={() => handleSave('Paystack')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="selar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Selar.co Integration</CardTitle>
                  <CardDescription>Connect your Selar.co account to process payments.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="selar-enabled">Enabled</Label>
                  <Switch 
                    id="selar-enabled"
                    checked={selarCredentials.isEnabled}
                    onCheckedChange={(checked) => handleToggleProvider('Selar.co', checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selar-api-key">API Key</Label>
                <Input
                  id="selar-api-key"
                  type="password"
                  placeholder="Your Selar API Key"
                  value={selarCredentials.apiKey}
                  onChange={(e) => setSelarCredentials({...selarCredentials, apiKey: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selar-merchant-id">Merchant ID</Label>
                <Input
                  id="selar-merchant-id"
                  type="text"
                  placeholder="Your Selar Merchant ID"
                  value={selarCredentials.merchantId || ''}
                  onChange={(e) => setSelarCredentials({...selarCredentials, merchantId: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="selar-test-mode" className="flex-grow">Test Mode</Label>
                <Switch 
                  id="selar-test-mode"
                  checked={selarCredentials.testMode}
                  onCheckedChange={(checked) => setSelarCredentials({...selarCredentials, testMode: checked})}
                />
              </div>
              
              {selarCredentials.testMode && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md flex gap-2 items-start mt-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    You are in test mode. No real payments will be processed. Use Selar.co test mode for testing.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => setSelarCredentials({
                apiKey: '',
                merchantId: '',
                testMode: true,
                isEnabled: false
              })}>
                Reset
              </Button>
              <Button onClick={() => handleSave('Selar.co')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Active Payment Providers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${stripeCredentials.isEnabled ? 'border-green-500' : 'opacity-60'}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Stripe</span>
              </div>
              {stripeCredentials.isEnabled ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-xs">Active</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Disabled</span>
              )}
            </CardContent>
          </Card>
          
          <Card className={`${flutterwaveCredentials.isEnabled ? 'border-green-500' : 'opacity-60'}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Flutterwave</span>
              </div>
              {flutterwaveCredentials.isEnabled ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-xs">Active</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Disabled</span>
              )}
            </CardContent>
          </Card>
          
          <Card className={`${paystackCredentials.isEnabled ? 'border-green-500' : 'opacity-60'}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Paystack</span>
              </div>
              {paystackCredentials.isEnabled ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-xs">Active</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Disabled</span>
              )}
            </CardContent>
          </Card>
          
          <Card className={`${selarCredentials.isEnabled ? 'border-green-500' : 'opacity-60'}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Selar.co</span>
              </div>
              {selarCredentials.isEnabled ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-xs">Active</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Disabled</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentIntegrationSettings;
