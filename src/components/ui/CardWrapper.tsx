
import {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardFooter as ShadcnCardFooter,
  CardTitle as ShadcnCardTitle,
  CardDescription as ShadcnCardDescription,
  CardContent as ShadcnCardContent
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Re-export with more responsive styling
export const Card = ({ className, ...props }: React.ComponentProps<typeof ShadcnCard>) => (
  <ShadcnCard 
    className={cn("w-full transition-all duration-300", className)} 
    {...props} 
  />
);

export const CardHeader = ({ className, ...props }: React.ComponentProps<typeof ShadcnCardHeader>) => (
  <ShadcnCardHeader 
    className={cn("p-4 sm:p-6", className)} 
    {...props} 
  />
);

export const CardFooter = ({ className, ...props }: React.ComponentProps<typeof ShadcnCardFooter>) => (
  <ShadcnCardFooter 
    className={cn("p-4 pt-0 sm:p-6 sm:pt-0", className)} 
    {...props} 
  />
);

export const CardTitle = ShadcnCardTitle;
export const CardDescription = ShadcnCardDescription;

export const CardContent = ({ className, ...props }: React.ComponentProps<typeof ShadcnCardContent>) => (
  <ShadcnCardContent 
    className={cn("p-4 pt-0 sm:p-6 sm:pt-0", className)} 
    {...props} 
  />
);
