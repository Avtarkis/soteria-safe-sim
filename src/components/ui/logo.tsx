
import React from 'react';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  withText?: boolean;
}

const Logo = ({ className, size = 'medium', withText = true }: LogoProps) => {
  const sizes = {
    small: { icon: 'h-6 w-6', text: 'text-lg' },
    medium: { icon: 'h-8 w-8', text: 'text-xl' },
    large: { icon: 'h-10 w-10', text: 'text-2xl' },
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "relative flex items-center justify-center",
        sizes[size].icon
      )}>
        <Shield 
          className={cn(
            "text-blue-600 dark:text-blue-400 absolute", 
            sizes[size].icon
          )} 
          fill="#dbeafe" 
          strokeWidth={2}
        />
      </div>

      {withText && (
        <span className={cn(
          "font-bold text-primary dark:text-primary-foreground",
          sizes[size].text
        )}>
          SecureTravel
          <span className="block text-xs text-muted-foreground">
            Where every second counts
          </span>
        </span>
      )}
    </div>
  );
};

export default Logo;
