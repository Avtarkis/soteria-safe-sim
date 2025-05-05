
import React from 'react';
import { cn } from '@/lib/utils';

interface SensorStatusIndicatorProps {
  icon: React.ReactNode;
  name: string;
  active: boolean;
  status: string;
}

const SensorStatusIndicator = ({
  icon,
  name,
  active,
  status
}: SensorStatusIndicatorProps) => {
  return (
    <div className={cn(
      "flex items-center gap-2 p-2 rounded-md text-sm border",
      active 
        ? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/30" 
        : "border-gray-200 bg-gray-50 dark:bg-gray-800/20 dark:border-gray-700/30"
    )}>
      <div className={cn(
        "p-1 rounded-full",
        active ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-medium">{name}</div>
        <div className={cn(
          "text-xs",
          active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
        )}>
          {active ? status : "Inactive"}
        </div>
      </div>
      <div className={cn(
        "w-2 h-2 rounded-full",
        active ? "bg-green-500 animate-pulse" : "bg-gray-300 dark:bg-gray-600"
      )} />
    </div>
  );
};

export default SensorStatusIndicator;
