
import React from 'react';
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'neo';
  hover?: boolean;
}

const Card = ({ className, children, variant = 'default', hover = false }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl p-6 shadow-sm",
        {
          "bg-card text-card-foreground": variant === 'default',
          "glass-morphism bg-white/10 backdrop-blur-xl": variant === 'glass',
          "neo-blur": variant === 'neo',
          "transition-all duration-300 hover:shadow-md hover:-translate-y-1": hover,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const CardHeader = ({ className, children }: CardHeaderProps) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

const CardTitle = ({ className, children }: CardTitleProps) => {
  return (
    <h3 className={cn("text-xl font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

const CardDescription = ({ className, children }: CardDescriptionProps) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

const CardContent = ({ className, children }: CardContentProps) => {
  return (
    <div className={cn("pt-0", className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

const CardFooter = ({ className, children }: CardFooterProps) => {
  return (
    <div className={cn("flex items-center pt-4", className)}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
