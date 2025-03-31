
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Key, Eye, EyeOff, ChevronRight } from 'lucide-react';
import ButtonWrapper from '@/components/ui/ButtonWrapper';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have the access token in the URL
    const params = new URLSearchParams(location.hash.substring(1));
    const accessToken = params.get('access_token');
    
    if (!accessToken) {
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link appears to be invalid or expired. Please request a new link.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [location, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      // Get access token from URL
      const params = new URLSearchParams(location.hash.substring(1));
      const accessToken = params.get('access_token');
      
      if (!accessToken) {
        setError('Reset link is invalid or expired');
        setLoading(false);
        return;
      }

      // Set the new password using the access token
      const { error } = await supabase.auth.updateUser(
        { password: password }
      );

      if (error) {
        setError(error.message);
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset. You can now log in with your new password.",
        });
        navigate('/');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('An unexpected error occurred. Please try again.');
      toast({
        title: "Password Reset Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <img src="/lovable-uploads/fd116965-8e8a-49e6-8cd8-3c8032d4d789.png" alt="Soteria Logo" className="h-20 w-20 animate-float" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gradient">SOTERIA</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Reset your password
          </p>
        </div>

        <div className="bg-card shadow-lg rounded-2xl p-8 mb-6 animate-scale-in">
          <h2 className="text-xl font-semibold mb-6">Create New Password</h2>

          {error && (
            <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="newPassword">
                New Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <ButtonWrapper
              type="submit"
              className="w-full mt-6 py-2 rounded-lg flex items-center justify-center"
              isLoading={loading}
            >
              <span>Reset Password</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </ButtonWrapper>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?
            <button
              type="button"
              className="ml-1 text-primary hover:underline font-medium"
              onClick={() => navigate('/')}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
