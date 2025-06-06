
import { useState, useCallback } from 'react';
import { nativeAPIManager } from '@/services/NativeAPIManager';
import { useToast } from '@/hooks/use-toast';

export function usePermissions() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});

  const requestPermissions = useCallback(async () => {
    try {
      const results = await nativeAPIManager.requestAllPermissions();
      setPermissions(results);
      
      const granted = Object.values(results).filter(Boolean).length;
      const total = Object.keys(results).length;
      
      toast({
        title: "Permissions Updated",
        description: `${granted}/${total} permissions granted for emergency features.`,
      });
      
      return results;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Permission Error",
        description: "Some emergency features may not work properly.",
        variant: "destructive"
      });
      return {};
    }
  }, [toast]);

  return {
    permissions,
    requestPermissions
  };
}
