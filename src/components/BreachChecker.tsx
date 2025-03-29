
import React, { useState } from 'react';
import { useBreachCheck, BreachData } from '@/services/hibpService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, AlertTriangle, Mail, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const BreachChecker = () => {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [breaches, setBreaches] = useState<BreachData[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const { checkEmail } = useBreachCheck();
  const { toast } = useToast();

  const handleCheck = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkEmail(email);
      setBreaches(result.breaches);
      setHasChecked(true);
      
      if (result.isBreached) {
        toast({
          title: 'Security Alert',
          description: `Your email was found in ${result.breachCount} data breach${result.breachCount !== 1 ? 'es' : ''}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Good News',
          description: 'Your email was not found in any known data breaches',
        });
      }
    } catch (error) {
      console.error('Error checking breaches:', error);
      toast({
        title: 'Error',
        description: 'There was a problem checking for breaches. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Data Breach Checker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              />
            </div>
            <Button onClick={handleCheck} disabled={isChecking}>
              {isChecking ? 'Checking...' : 'Check'}
            </Button>
          </div>

          {hasChecked && (
            <div className="mt-4">
              {breaches.length === 0 ? (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <p className="text-green-700 dark:text-green-300">Good news! Your email was not found in any known data breaches.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700 dark:text-red-300">
                      Your email was found in {breaches.length} data {breaches.length === 1 ? 'breach' : 'breaches'}.
                    </p>
                  </div>
                  
                  <div className="max-h-60 overflow-auto rounded-md border">
                    {breaches.map((breach) => (
                      <div key={breach.Name} className="p-3 border-b last:border-b-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{breach.Title}</h3>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            breach.IsSensitive || breach.PwnCount > 10000000 
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                              : breach.PwnCount > 1000000 
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" 
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          )}>
                            {breach.IsSensitive ? 'High Risk' : breach.PwnCount > 1000000 ? 'Medium Risk' : 'Low Risk'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Breach date: {breach.BreachDate}</p>
                        <p className="text-sm mt-2">{breach.Description.slice(0, 120)}...</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {breach.DataClasses.slice(0, 5).map((dataClass) => (
                            <span key={dataClass} className="text-xs bg-secondary px-2 py-0.5 rounded">
                              {dataClass}
                            </span>
                          ))}
                          {breach.DataClasses.length > 5 && (
                            <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                              +{breach.DataClasses.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Powered by HaveIBeenPwned
        </p>
        <a 
          href="https://haveibeenpwned.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-primary flex items-center hover:underline"
        >
          Learn more <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  );
};

export default BreachChecker;
