
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LogoDownloader = () => {
  const { toast } = useToast();
  const handleDownload = () => {
    // Create an SVG string for download
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0284c7">
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
    </svg>`;
    
    // Create a blob from the SVG string
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const link = document.createElement('a');
    
    // Set the href to the blob URL
    link.href = url;
    
    // Set the download attribute to specify the filename
    link.download = 'soteria-logo.svg';
    
    // Append the link to the body
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Logo Downloaded",
      description: "Your Soteria logo has been downloaded successfully.",
    });
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
