
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  type: 'login' | 'signup';
}

const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'login') {
        await login(email, password);
        toast({
          title: "Login Successful",
          description: "Welcome back to SecureTravel. Where every second counts.",
        });
      } else {
        await signup(email, password, name);
        toast({
          title: "Account Created",
          description: "Your SecureTravel account has been created. Where every second counts.",
        });
      }
      
      // Navigate to map on success
      navigate('/map');
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: type === 'login' 
          ? "Invalid email or password. Please try again." 
          : "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center pb-10 pt-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <CardTitle className="text-2xl text-center">
            {type === 'login' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription className="text-center">
            {type === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Enter your information to create an account'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {type === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {type === 'login' && (
                  <Button variant="link" className="px-0 text-xs" size="sm">
                    Forgot password?
                  </Button>
                )}
              </div>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Secure login protected - where every second counts for your safety
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button disabled={loading} className="w-full mb-4" type="submit">
              {loading ? (
                <span className="flex items-center gap-1">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  {type === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                <span>{type === 'login' ? 'Sign in' : 'Create account'}</span>
              )}
            </Button>
            <div className="text-center text-sm">
              {type === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <Button variant="link" onClick={() => navigate('/signup')} className="p-0 h-auto">
                    Sign up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Button variant="link" onClick={() => navigate('/login')} className="p-0 h-auto">
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthForm;
