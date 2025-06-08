
import { supabase } from '@/lib/supabase';

interface UserData {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

interface ThreatData {
  id: string;
  title: string;
  description: string;
  severity: string;
  created_at: string;
  user_id?: string;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  user_id?: string;
  assigned_to?: string;
}

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  emergencyAlerts: number;
  resolvedTickets: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface UserMetrics {
  signups: Array<{ date: string; count: number }>;
  activity: Array<{ date: string; activeUsers: number }>;
  retention: Array<{ period: string; rate: number }>;
}

interface EmergencyMetrics {
  totalAlerts: number;
  criticalAlerts: number;
}

interface SupabaseUser {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

class AdminDataService {
  async getUsers(): Promise<UserData[]> {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      return data.users.map((user: SupabaseUser) => ({
        id: user.id,
        email: user.email || 'No email',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || undefined,
        email_confirmed_at: user.email_confirmed_at || undefined,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getUserStats() {
    try {
      const { data: users, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const totalUsers = users.users.length;
      const newThisWeek = users.users.filter((user: SupabaseUser) => 
        new Date(user.created_at) >= weekAgo
      ).length;
      const newThisMonth = users.users.filter((user: SupabaseUser) => 
        new Date(user.created_at) >= monthAgo
      ).length;
      
      return {
        total: totalUsers,
        newThisWeek,
        newThisMonth,
        activeUsers: users.users.filter((user: SupabaseUser) => user.last_sign_in_at).length
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { total: 0, newThisWeek: 0, newThisMonth: 0, activeUsers: 0 };
    }
  }

  async getAdminMetrics(): Promise<AdminMetrics> {
    try {
      const [users, tickets, alerts] = await Promise.all([
        this.getUserMetrics(),
        this.getTicketMetrics(),
        this.getEmergencyMetrics()
      ]);

      return {
        totalUsers: users.totalUsers,
        activeUsers: users.activeUsers,
        emergencyAlerts: alerts.totalAlerts,
        resolvedTickets: tickets.resolved,
        systemHealth: this.calculateSystemHealth(users, tickets, alerts)
      };
    } catch (error) {
      console.error('Error fetching admin metrics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        emergencyAlerts: 0,
        resolvedTickets: 0,
        systemHealth: 'critical'
      };
    }
  }

  private async getUserMetrics() {
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;

    const totalUsers = users.users.length;
    const activeUsers = users.users.filter((user: SupabaseUser) => 
      new Date(user.last_sign_in_at || 0) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return { totalUsers, activeUsers };
  }

  private async getTicketMetrics() {
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('status');

    if (error) throw error;

    const resolved = tickets?.filter(t => t.status === 'resolved').length || 0;
    const pending = tickets?.filter(t => t.status === 'open').length || 0;

    return { resolved, pending };
  }

  private async getEmergencyMetrics() {
    const { data: alerts, error } = await supabase
      .from('user_alerts')
      .select('severity, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const totalAlerts = alerts?.length || 0;
    const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0;

    return { totalAlerts, criticalAlerts };
  }

  private calculateSystemHealth(users: any, tickets: any, alerts: any): 'healthy' | 'warning' | 'critical' {
    const activeUserRate = users.totalUsers > 0 ? users.activeUsers / users.totalUsers : 0;
    const ticketBacklog = tickets.pending;
    const criticalAlerts = alerts.criticalAlerts;

    if (criticalAlerts > 10 || activeUserRate < 0.1) {
      return 'critical';
    } else if (criticalAlerts > 5 || ticketBacklog > 20 || activeUserRate < 0.3) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }

  async getUserAnalytics(days: number = 30): Promise<UserMetrics> {
    try {
      const { data: users, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;

      // Process user data for analytics
      const signups = this.processSignupData(users.users, days);
      const activity = this.processActivityData(users.users, days);
      const retention = this.calculateRetention(users.users);

      return { signups, activity, retention };
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return { signups: [], activity: [], retention: [] };
    }
  }

  private processSignupData(users: SupabaseUser[], days: number) {
    const signupCounts: { [key: string]: number } = {};
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    users.forEach(user => {
      const signupDate = new Date(user.created_at);
      if (signupDate >= cutoffDate) {
        const dateKey = signupDate.toISOString().split('T')[0];
        signupCounts[dateKey] = (signupCounts[dateKey] || 0) + 1;
      }
    });

    return Object.entries(signupCounts).map(([date, count]) => ({ date, count }));
  }

  private processActivityData(users: SupabaseUser[], days: number) {
    const activityCounts: { [key: string]: number } = {};
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    users.forEach(user => {
      const lastSignIn = new Date(user.last_sign_in_at || 0);
      if (lastSignIn >= cutoffDate) {
        const dateKey = lastSignIn.toISOString().split('T')[0];
        activityCounts[dateKey] = (activityCounts[dateKey] || 0) + 1;
      }
    });

    return Object.entries(activityCounts).map(([date, activeUsers]) => ({ date, activeUsers }));
  }

  private calculateRetention(users: SupabaseUser[]) {
    // Calculate 7-day, 30-day retention rates
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const sevenDayUsers = users.filter(u => new Date(u.created_at).getTime() <= sevenDaysAgo);
    const thirtyDayUsers = users.filter(u => new Date(u.created_at).getTime() <= thirtyDaysAgo);

    const sevenDayRetained = sevenDayUsers.filter(u => 
      new Date(u.last_sign_in_at || 0).getTime() > sevenDaysAgo
    ).length;

    const thirtyDayRetained = thirtyDayUsers.filter(u => 
      new Date(u.last_sign_in_at || 0).getTime() > thirtyDaysAgo
    ).length;

    return [
      { period: '7-day', rate: sevenDayUsers.length > 0 ? sevenDayRetained / sevenDayUsers.length : 0 },
      { period: '30-day', rate: thirtyDayUsers.length > 0 ? thirtyDayRetained / thirtyDayUsers.length : 0 }
    ];
  }
}

export const adminDataService = new AdminDataService();
export default adminDataService;
export type { AdminMetrics, UserMetrics, EmergencyMetrics };
