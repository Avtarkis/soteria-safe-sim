
import React from 'react';
import { Users, Shield, Bell, Check, Clock, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const AdminOverview = () => {
  // Sample data for the dashboard
  const stats = [
    { title: 'Total Users', value: '2,846', icon: Users, change: '+12.5%', changeType: 'positive' },
    { title: 'Active Alerts', value: '24', icon: Bell, change: '-4.3%', changeType: 'positive' },
    { title: 'Threat Detections', value: '512', icon: Shield, change: '+22.4%', changeType: 'negative' },
    { title: 'Response Rate', value: '99.3%', icon: Check, change: '+1.2%', changeType: 'positive' },
  ];

  const recentAlerts = [
    { id: 'AL-7291', type: 'High', user: 'sarah.johnson@example.com', location: 'Barcelona, Spain', time: '14 minutes ago', status: 'Pending' },
    { id: 'AL-7290', type: 'Medium', user: 'marcus.wilson@example.com', location: 'Toronto, Canada', time: '32 minutes ago', status: 'Resolved' },
    { id: 'AL-7289', type: 'High', user: 'elena.tsu@example.com', location: 'Tokyo, Japan', time: '1 hour ago', status: 'Resolved' },
    { id: 'AL-7288', type: 'Low', user: 'diego.martinez@example.com', location: 'Mexico City, Mexico', time: '2 hours ago', status: 'Resolved' },
    { id: 'AL-7287', type: 'Medium', user: 'jennifer.smith@example.com', location: 'Sydney, Australia', time: '3 hours ago', status: 'Resolved' },
  ];

  const recentUsers = [
    { id: 'U-5128', name: 'Michael Brown', email: 'michael.brown@example.com', joined: '2 hours ago', plan: 'Family' },
    { id: 'U-5127', name: 'Emma Watson', email: 'emma.watson@example.com', joined: '4 hours ago', plan: 'Individual' },
    { id: 'U-5126', name: 'James Parker', email: 'james.parker@example.com', joined: '1 day ago', plan: 'Individual' },
    { id: 'U-5125', name: 'Sophia Rodriguez', email: 'sophia.rodriguez@example.com', joined: '1 day ago', plan: 'Family' },
    { id: 'U-5124', name: 'William Chen', email: 'william.chen@example.com', joined: '2 days ago', plan: 'Individual' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage all aspects of the Soteria security platform.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`flex items-center text-xs ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                <span className="flex items-center">
                  {stat.changeType === 'positive' ? 
                    <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                    <ArrowUpRight className="h-3 w-3 mr-1 rotate-180" />}
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Activity */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.id}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        alert.type === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        alert.type === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {alert.type}
                      </span>
                    </TableCell>
                    <TableCell className="truncate max-w-[140px]">{alert.user}</TableCell>
                    <TableCell>
                      <span className={`flex items-center ${
                        alert.status === 'Pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {alert.status === 'Pending' ? (
                          <Clock className="h-3 w-3 mr-1" />
                        ) : (
                          <Check className="h-3 w-3 mr-1" />
                        )}
                        {alert.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Plan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.joined}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.plan === 'Family' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {user.plan}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
