
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/CardWrapper';
import { Shield } from 'lucide-react';
import BreachChecker from '@/components/BreachChecker';

const CyberSecurityBreaches = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">Data Breach Protection</h2>
        <p className="text-muted-foreground">
          Check if your credentials have been compromised in a data breach.
        </p>
      </div>
      
      <div className="grid gap-6">
        <BreachChecker />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Protect Yourself From Data Breaches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">1. Use Strong, Unique Passwords</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Never reuse passwords across different sites. Consider using a password manager to generate and store strong, unique passwords.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">2. Enable Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add an extra layer of security by enabling 2FA on all accounts that support it.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">3. Regularly Monitor Your Accounts</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Check for suspicious activity regularly and be alert to phishing attempts.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">4. Update Software Promptly</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep your devices, apps, and software updated to patch security vulnerabilities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CyberSecurityBreaches;
