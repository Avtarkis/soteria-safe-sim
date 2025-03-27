
import React from 'react';
import { Button as ShadcnButton } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const ButtonWrapper = ({
  variant = "default",
  size = "default",
  isLoading = false,
  loadingText,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <ShadcnButton
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </ShadcnButton>
  );
};

export default ButtonWrapper;
