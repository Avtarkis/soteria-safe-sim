
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const LogoDownloader = () => {
  const handleDownload = () => {
    // Create a link element
    const link = document.createElement('a');
    
    // Set the href to the SVG file
    link.href = '/logo.svg';
    
    // Set the download attribute to specify the filename
    link.download = 'soteria-logo.svg';
    
    // Append the link to the body
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDownload}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      <span>Download Logo</span>
    </Button>
  );
};

export default LogoDownloader;
