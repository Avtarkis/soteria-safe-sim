
import React from 'react';
import { Button } from '@/components/ui/button';

interface SettingsHeaderProps {
  loading: boolean;
  onSave: () => void;
}

const SettingsHeader = ({ loading, onSave }: SettingsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Button onClick={onSave} disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export default SettingsHeader;
