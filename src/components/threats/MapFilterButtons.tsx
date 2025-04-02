
import React from 'react';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  label: string;
  active: boolean;
  color: string;
}

interface MapFilterButtonsProps {
  filters: FilterOption[];
  toggleFilter: (id: string) => void;
}

const MapFilterButtons = ({ filters, toggleFilter }: MapFilterButtonsProps) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2">
      {filters.map(filter => (
        <button
          key={filter.id}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm transition-all",
            filter.active 
              ? `${filter.color} text-white` 
              : "bg-background/80 text-muted-foreground"
          )}
          onClick={() => toggleFilter(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default MapFilterButtons;
