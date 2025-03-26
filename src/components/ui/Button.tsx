
import React from 'react';
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  isLoading?: boolean;
}

const Button = ({
  variant = 'primary',
  size = 'default',
  className,
  children,
  disabled,
  isLoading,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center font-medium transition-all ease-out duration-300 outline-none",
        "disabled:opacity-50 disabled:pointer-events-none",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
        {
          // Default/Primary styles
          "bg-primary text-white hover:bg-primary/90": variant === 'primary',
          // Secondary styles
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === 'secondary',
          // Outline styles
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground": variant === 'outline',
          // Destructive styles
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === 'destructive',
          // Ghost styles
          "hover:bg-accent hover:text-accent-foreground": variant === 'ghost',
          // Link styles
          "text-primary underline-offset-4 hover:underline": variant === 'link',
          // Sizes
          "h-10 px-4 rounded-md text-sm": size === 'default',
          "h-9 rounded-md px-3": size === 'sm',
          "h-11 rounded-md px-8": size === 'lg',
          "h-10 w-10 rounded-full": size === 'icon',
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : null}
      <span className={isLoading ? "opacity-0" : ""}>{children}</span>
    </button>
  );
};

export default Button;
