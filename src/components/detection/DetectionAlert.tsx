
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/CardWrapper';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Info, MapPin } from 'lucide-react';
import { DetectionAlert as DetectionAlertType } from '@/types/detection';
import { useToast } from '@/hooks/use-toast';

interface DetectionAlertProps {
  alert: DetectionAlertType;
  onClose: () => void;
  onViewOnMap?: () => void;
}

const DetectionAlert = ({ alert, onClose, onViewOnMap }: DetectionAlertProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Vibrate the device if supported
    if ('vibrate' in navigator) {
      const pattern = alert.level === 3 ? [300, 100, 300, 100, 300] : 
                     alert.level === 2 ? [200, 100, 200] : [200];
      navigator.vibrate(pattern);
    }

    // Speak the alert message using Web Speech API
    if ('speechSynthesis' in window) {
      const message = `Dangerous ${alert.weaponType || 'weapon'} detected nearby. Stay safe please.`;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  }, [alert]);

  const getBgColor = () => {
    switch (alert.level) {
      case 3: return 'bg-red-600 dark:bg-red-900';
      case 2: return 'bg-orange-500 dark:bg-orange-800';
      default: return 'bg-amber-500 dark:bg-amber-800';
    }
  };

  const getTextColor = () => {
    return 'text-white';
  };

  return (
    <Card className={`${getBgColor()} ${getTextColor()} shadow-xl p-4 animate-pulse-once`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-bold text-lg">
            {alert.title || 'Weapons Alert'}
          </h3>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="mb-3">
        {alert.description || 'A potential weapon has been detected in your vicinity.'}
      </p>
      
      {alert.confidence > 0 && (
        <div className="text-sm mb-2 flex items-center gap-1 opacity-90">
          <Info className="h-4 w-4" />
          <span>Confidence: {Math.round(alert.confidence * 100)}%</span>
        </div>
      )}
      
      {alert.location && (
        <div className="text-sm mb-3 flex items-center gap-1 opacity-90">
          <MapPin className="h-4 w-4" />
          <span>
            Location: {alert.location[0].toFixed(6)}, {alert.location[1].toFixed(6)}
          </span>
        </div>
      )}
      
      <div className="flex justify-end gap-2 mt-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onClose}
          className="bg-white/25 hover:bg-white/40 text-white border-none"
        >
          Dismiss
        </Button>
        
        {onViewOnMap && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onViewOnMap}
            className="bg-white/25 hover:bg-white/40 text-white border-none"
          >
            View on Map
          </Button>
        )}
      </div>
    </Card>
  );
};

export default DetectionAlert;
