import React, { useState } from 'react';
import { Search, Plus, Filter, Map, Trash2, Clock, AlertTriangle, Check, ChevronDown, Shield, Cloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export const AdminThreatManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const threats = [
    { 
      id: 'T-4102', 
      title: 'Suspicious Activity',
      type: 'Cyber',
      level: 'High',
      location: 'Paris, France',
      timestamp: '2023-05-02 10:15',
      status: 'Active',
      affects: 15
    },
    { 
      id: 'T-4101', 
      title: 'Potential Data Breach',
      type: 'Cyber',
      level: 'High',
      location: 'Global',
      timestamp: '2023-05-01 16:30',
      status: 'Active',
      affects: 248
    },
    { 
      id: 'T-4100', 
      title: 'Street Protest',
      type: 'Physical',
      level: 'Medium',
      location: 'Madrid, Spain',
      timestamp: '2023-04-30 13:45',
      status: 'Active',
      affects: 18
    },
    { 
      id: 'T-4099', 
      title: 'Flash Flood Warning',
      type: 'Environmental',
      level: 'High',
      location: 'Bangkok, Thailand',
      timestamp: '2023-04-29 09:20',
      status: 'Active',
      affects: 56
    },
    { 
      id: 'T-4098', 
      title: 'Phishing Campaign',
      type: 'Cyber',
      level: 'Medium',
      location: 'Global',
      timestamp: '2023-04-28 14:10',
      status: 'Resolved',
      affects: 87
    },
    { 
      id: 'T-4097', 
      title: 'Transport Strike',
      type: 'Physical',
      level: 'Low',
      location: 'London, UK',
      timestamp: '2023-04-27 08:30',
      status: 'Resolved',
      affects: 42
    },
    { 
      id: 'T-4096', 
      title: 'Malware Distribution',
      type: 'Cyber',
      level: 'High',
      location: 'Global',
      timestamp: '2023-04-26 11:45',
      status: 'Resolved',
      affects: 156
    },
  ];

  const filteredThreats = threats.filter((threat) => 
    (threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    threat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    threat.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeThreatCount = threats.filter(threat => threat.status === 'Active').length;
  const resolvedThreatCount = threats.filter(threat => threat.status === 'Resolved').length;

  const handleResolve = (threatId: string) => {
    toast({
      title: 'Threat Resolved',
      description: `Threat ${threatId} has been marked as resolved.`,
    });
  };

  const handleDelete = (threatId: string) => {
    toast({
      title: 'Threat Deleted',
      description: `Threat ${threatId} has been deleted from the system.`,
    });
  };

  const handleCreateThreat = () => {
    toast({
      title: 'New Threat Created',
      description: 'The new threat has been added to the system.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Threat Management</h1>
        <p className="text-muted-foreground">Monitor and manage security threats across the platform.</p>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <TabsList>
            <TabsTrigger value="all">All Threats ({threats.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeThreatCount})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedThreatCount})</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Threat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Threat</DialogTitle>
                  <DialogDescription>
                    Add a new threat to the system. This will be visible to affected users.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="title" className="text-right text-sm">Title</label>
                    <Input id="title" className="col-span-3" placeholder="E.g., Suspicious Activity" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="type" className="text-right text-sm">Type</label>
                    <select id="type" className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option>Cyber</option>
                      <option>Physical</option>
                      <option>Environmental</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="level" className="text-right text-sm">Level</label>
                    <select id="level" className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="location" className="text-right text-sm">Location</label>
                    <Input id="location" className="col-span-3" placeholder="E.g., London, UK" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right text-sm">Description</label>
                    <textarea 
                      id="description" 
                      className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Detailed description of the threat..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleCreateThreat}>Create Threat</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="icon">
              <Map className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search threats..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Threat</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users Affected</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThreats.map((threat) => (
                    <TableRow key={threat.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{threat.id}</TableCell>
                      <TableCell>{threat.title}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 ${
                          threat.type === 'Cyber' ? 'text-blue-600 dark:text-blue-400' :
                          threat.type === 'Physical' ? 'text-orange-600 dark:text-orange-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {threat.type === 'Cyber' && <Shield className="h-3 w-3" />}
                          {threat.type === 'Physical' && <AlertTriangle className="h-3 w-3" />}
                          {threat.type === 'Environmental' && <Cloud className="h-3 w-3" />}
                          {threat.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          threat.level === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          threat.level === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {threat.level}
                        </span>
                      </TableCell>
                      <TableCell>{threat.location}</TableCell>
                      <TableCell>
                        <span className={`flex items-center gap-1 ${
                          threat.status === 'Active' ? 'text-amber-600 dark:text-amber-400' : 
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {threat.status === 'Active' ? (
                            <Clock className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          {threat.status}
                        </span>
                      </TableCell>
                      <TableCell>{threat.affects}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {threat.status === 'Active' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResolve(threat.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 dark:text-red-400"
                            onClick={() => handleDelete(threat.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredThreats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No threats found. Try a different search term.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Threat</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Users Affected</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThreats
                    .filter(threat => threat.status === 'Active')
                    .map((threat) => (
                      <TableRow key={threat.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{threat.id}</TableCell>
                        <TableCell>{threat.title}</TableCell>
                        <TableCell>
                          <span className={`flex items-center gap-1 ${
                            threat.type === 'Cyber' ? 'text-blue-600 dark:text-blue-400' :
                            threat.type === 'Physical' ? 'text-orange-600 dark:text-orange-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {threat.type === 'Cyber' && <Shield className="h-3 w-3" />}
                            {threat.type === 'Physical' && <AlertTriangle className="h-3 w-3" />}
                            {threat.type === 'Environmental' && <Cloud className="h-3 w-3" />}
                            {threat.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            threat.level === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            threat.level === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {threat.level}
                          </span>
                        </TableCell>
                        <TableCell>{threat.location}</TableCell>
                        <TableCell>{threat.affects}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResolve(threat.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 dark:text-red-400"
                              onClick={() => handleDelete(threat.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  
                  {filteredThreats.filter(threat => threat.status === 'Active').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No active threats found. Try a different search term.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resolved" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Threat</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Resolved At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredThreats
                    .filter(threat => threat.status === 'Resolved')
                    .map((threat) => (
                      <TableRow key={threat.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{threat.id}</TableCell>
                        <TableCell>{threat.title}</TableCell>
                        <TableCell>
                          <span className={`flex items-center gap-1 ${
                            threat.type === 'Cyber' ? 'text-blue-600 dark:text-blue-400' :
                            threat.type === 'Physical' ? 'text-orange-600 dark:text-orange-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {threat.type === 'Cyber' && <Shield className="h-3 w-3" />}
                            {threat.type === 'Physical' && <AlertTriangle className="h-3 w-3" />}
                            {threat.type === 'Environmental' && <Cloud className="h-3 w-3" />}
                            {threat.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            threat.level === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            threat.level === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {threat.level}
                          </span>
                        </TableCell>
                        <TableCell>{threat.location}</TableCell>
                        <TableCell>{threat.timestamp}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 dark:text-red-400"
                            onClick={() => handleDelete(threat.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  
                  {filteredThreats.filter(threat => threat.status === 'Resolved').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No resolved threats found. Try a different search term.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Cloud = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </svg>
);
