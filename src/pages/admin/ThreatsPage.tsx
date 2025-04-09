
import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, AlertTriangle, Download, Trash2, Eye, Shield, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ThreatData {
  id: string;
  title: string;
  type: 'cyber' | 'physical' | 'environmental';
  level: 'low' | 'medium' | 'high';
  location: string;
  reported: string;
  status: 'active' | 'resolved' | 'investigating';
  details: string;
}

const ThreatsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedThreats, setSelectedThreats] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Sample threat data
  const threats: ThreatData[] = [
    { 
      id: 'T-1001', 
      title: 'Suspicious Network Activity', 
      type: 'cyber',
      level: 'medium',
      location: 'Server Room A',
      reported: '2023-05-01 14:30',
      status: 'investigating',
      details: 'Multiple failed login attempts detected from unknown IP addresses.'
    },
    { 
      id: 'T-1002', 
      title: 'Fire Alarm Triggered', 
      type: 'physical',
      level: 'high',
      location: 'Building 2, Floor 3',
      reported: '2023-05-02 09:15',
      status: 'resolved',
      details: 'Fire alarm triggered in east wing. Fire department responded. False alarm confirmed.'
    },
    { 
      id: 'T-1003', 
      title: 'Potential Data Breach', 
      type: 'cyber',
      level: 'high',
      location: 'Database Cluster',
      reported: '2023-05-02 11:45',
      status: 'active',
      details: 'Unusual data export activity detected. Security team investigating.'
    },
    { 
      id: 'T-1004', 
      title: 'Unauthorized Access', 
      type: 'physical',
      level: 'medium',
      location: 'Restricted Area C',
      reported: '2023-05-02 16:20',
      status: 'resolved',
      details: 'Badge scanner detected unauthorized access attempt. Security notified.'
    },
    { 
      id: 'T-1005', 
      title: 'Chemical Spill', 
      type: 'environmental',
      level: 'high',
      location: 'Lab 204',
      reported: '2023-05-03 10:05',
      status: 'resolved',
      details: 'Minor chemical spill in research lab. Contained and cleaned by hazmat team.'
    },
    { 
      id: 'T-1006', 
      title: 'Power Outage', 
      type: 'environmental',
      level: 'medium',
      location: 'North Campus',
      reported: '2023-05-03 08:45',
      status: 'resolved',
      details: 'Power outage affecting north campus buildings. Backup generators activated.'
    },
    { 
      id: 'T-1007', 
      title: 'Phishing Campaign', 
      type: 'cyber',
      level: 'medium',
      location: 'Company-wide',
      reported: '2023-05-03 17:30',
      status: 'active',
      details: 'Targeted phishing emails reported by multiple employees. IT security investigating.'
    },
  ];

  // Filter threats based on search term
  const filteredThreats = threats.filter((threat) => 
    threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    threat.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    threat.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectThreat = (threatId: string) => {
    if (selectedThreats.includes(threatId)) {
      setSelectedThreats(selectedThreats.filter(id => id !== threatId));
    } else {
      setSelectedThreats([...selectedThreats, threatId]);
    }
  };

  const handleExportThreats = () => {
    toast({
      title: "Threats data exported",
      description: "The threat data has been exported to CSV successfully.",
    });
  };

  const handleDeleteSelected = () => {
    toast({
      title: `${selectedThreats.length} threats deleted`,
      description: "The selected threats have been deleted from the system.",
    });
    setSelectedThreats([]);
  };

  const getLevelBadge = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800">High</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: 'cyber' | 'physical' | 'environmental') => {
    switch (type) {
      case 'cyber':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Cyber</Badge>;
      case 'physical':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">Physical</Badge>;
      case 'environmental':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Environmental</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: 'active' | 'resolved' | 'investigating') => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Active</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Investigating</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Threat Management</h1>
          <div className="flex space-x-2">
            <Button variant="default" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              New Threat
            </Button>
            {selectedThreats.length > 0 && (
              <Button onClick={handleDeleteSelected} variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            )}
            <Button onClick={handleExportThreats} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Threats</CardTitle>
            <div className="flex space-x-2 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search threats..."
                  className="w-full pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedThreats.length === filteredThreats.length && filteredThreats.length > 0}
                      onChange={() => {
                        if (selectedThreats.length === filteredThreats.length) {
                          setSelectedThreats([]);
                        } else {
                          setSelectedThreats(filteredThreats.map(threat => threat.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Threat</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredThreats.map((threat) => (
                  <TableRow key={threat.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedThreats.includes(threat.id)}
                        onChange={() => handleSelectThreat(threat.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{threat.title}</div>
                        <div className="text-xs text-muted-foreground">{threat.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(threat.type)}</TableCell>
                    <TableCell>{getLevelBadge(threat.level)}</TableCell>
                    <TableCell>{threat.location}</TableCell>
                    <TableCell>{getStatusBadge(threat.status)}</TableCell>
                    <TableCell>{threat.reported}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MapPin className="mr-2 h-4 w-4" />
                            Show on Map
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Mark as Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredThreats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No threats found matching your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThreatsPage;
