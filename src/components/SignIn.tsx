
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SignInProps {
  toggleSignUp: () => void;
  toggleForgotPassword: () => void;
}

const SignIn: React.FC<SignInProps> = ({ toggleSignUp, toggleForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting to sign in with:", email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.log("Sign in error details:", error);
        toast({
          title: "Sign in issue",
          description: `Error: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log("Sign in successful, navigating to map");
        toast({
          title: "Success!",
          description: "You have been signed in successfully.",
        });
        
        // Delay navigation slightly to allow toast to be seen
        setTimeout(() => {
          // Navigate to map page instead of dashboard
          navigate('/map');
        }, 300);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gray-800 text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription className="text-gray-300">
          Enter your email and password to access your account
          <p className="text-xs mt-1 text-green-500">Testing mode: Email verification bypassed</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <button 
                type="button" 
                onClick={toggleForgotPassword} 
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground text-gray-400">
          Don't have an account?{" "}
          <button 
            type="button" 
            onClick={toggleSignUp} 
            className="text-primary hover:underline"
          >
            Sign up
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignIn;
