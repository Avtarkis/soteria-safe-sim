
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const UsersPage = () => {
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

  const handleExportUsers = () => {
    toast({
      title: "Users data exported",
      description: "The user data has been exported to CSV successfully.",
    });
  };

  const handleAddUser = () => {
    toast({
      title: "Coming Soon",
      description: "This functionality will be available in a future update.",
    });
  };

  const handleDeleteSelected = () => {
    toast({
      title: `${selectedUsers.length} users deleted`,
      description: "The selected users have been deleted successfully.",
    });
    setSelectedUsers([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="flex space-x-2">
            <Button onClick={handleAddUser} size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
            {selectedUsers.length > 0 && (
              <Button onClick={handleDeleteSelected} variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            )}
            <Button onClick={handleExportUsers} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Users</CardTitle>
            <div className="flex space-x-2 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
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
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={() => {
                        if (selectedUsers.length === filteredUsers.length) {
                          setSelectedUsers([]);
                        } else {
                          setSelectedUsers(filteredUsers.map(user => user.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">{user.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.plan}</TableCell>
                    <TableCell>{user.joinDate}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
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
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No users found matching your search criteria.
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

export default UsersPage;
