
import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, UserPlus, Download, Trash2, Edit2, Mail, Shield, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Sample user data
  const users = [
    { 
      id: 'U-5128', 
      name: 'Michael Brown', 
      email: 'michael.brown@example.com', 
      status: 'Active',
      joinDate: '2023-04-15',
      plan: 'Family',
      lastLogin: '2023-05-01 14:30'
    },
    { 
      id: 'U-5127', 
      name: 'Emma Watson', 
      email: 'emma.watson@example.com', 
      status: 'Active',
      joinDate: '2023-04-10',
      plan: 'Individual',
      lastLogin: '2023-05-02 09:15'
    },
    { 
      id: 'U-5126', 
      name: 'James Parker', 
      email: 'james.parker@example.com', 
      status: 'Inactive',
      joinDate: '2023-03-22',
      plan: 'Individual',
      lastLogin: '2023-04-15 11:45'
    },
    { 
      id: 'U-5125', 
      name: 'Sophia Rodriguez', 
      email: 'sophia.rodriguez@example.com', 
      status: 'Active',
      joinDate: '2023-03-18',
      plan: 'Family',
      lastLogin: '2023-05-01 16:20'
    },
    { 
      id: 'U-5124', 
      name: 'William Chen', 
      email: 'william.chen@example.com', 
      status: 'Suspended',
      joinDate: '2023-02-05',
      plan: 'Individual',
      lastLogin: '2023-04-28 10:05'
    },
    { 
      id: 'U-5123', 
      name: 'Olivia Johnson', 
      email: 'olivia.johnson@example.com', 
      status: 'Active',
      joinDate: '2023-01-30',
      plan: 'Family',
      lastLogin: '2023-05-02 08:45'
    },
    { 
      id: 'U-5122', 
      name: 'Ethan Williams', 
      email: 'ethan.williams@example.com', 
      status: 'Active',
      joinDate: '2023-01-12',
      plan: 'Individual',
      lastLogin: '2023-04-30 17:30'
    },
  ];

  // Filter users based on search term
  const filteredUsers = users.filter((user) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleUserAction = (action: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    
    if (!user) return;

    let message = '';
    
    switch (action) {
      case 'edit':
        message = `Edit user: ${user.name}`;
        break;
      case 'suspend':
        message = `User ${user.name} has been suspended`;
        break;
      case 'delete':
        message = `User ${user.name} has been deleted`;
        break;
      case 'email':
        message = `Email sent to ${user.email}`;
        break;
      case 'elevate':
        message = `${user.name} has been granted admin privileges`;
        break;
    }
    
    toast({
      title: 'User Management',
      description: message,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts, permissions, and activity.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2 max-w-md flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search users..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account. They'll receive an email with instructions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right text-sm">Name</label>
                  <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right text-sm">Email</label>
                  <Input id="email" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="plan" className="text-right text-sm">Plan</label>
                  <select id="plan" className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option>Individual</option>
                    <option>Family</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      user.status === 'Inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.plan === 'Family' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {user.plan}
                    </span>
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUserAction('edit', user.id)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction('email', user.id)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction('elevate', user.id)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Grant Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction('suspend', user.id)} className="text-amber-600 dark:text-amber-400">
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend Account
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUserAction('delete', user.id)} className="text-red-600 dark:text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No users found. Try a different search term.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
