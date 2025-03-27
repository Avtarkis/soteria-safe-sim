
import {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardFooter as ShadcnCardFooter,
  CardTitle as ShadcnCardTitle,
  CardDescription as ShadcnCardDescription,
  CardContent as ShadcnCardContent
} from "@/components/ui/card";

// Re-export with more mobile-friendly default styling
export const Card = ({ className, ...props }: React.ComponentProps<typeof ShadcnCard>) => (
  <ShadcnCard className={`w-full ${className || ''}`} {...props} />
);

export const CardHeader = ShadcnCardHeader;
export const CardFooter = ShadcnCardFooter;
export const CardTitle = ShadcnCardTitle;
export const CardDescription = ShadcnCardDescription;
export const CardContent = ShadcnCardContent;
