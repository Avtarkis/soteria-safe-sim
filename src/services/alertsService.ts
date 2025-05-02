
import { supabase } from '@/lib/supabase';
import { Alert, AlertStatus, AlertCategory } from '@/types/alerts';
import { threatService } from '@/services/threatService';

// Fetch alerts from different sources
export const fetchUserAlerts = async (userId: string) => {
  let storedAlerts: any[] = [];
  try {
    // Try to use the stored procedure first
    const { data, error } = await supabase
      .rpc('get_user_alerts', { user_uuid: userId })
      .returns();
      
    if (error) {
      // If the RPC doesn't exist, fall back to direct querying
      const { data: directData, error: directError } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (directError) throw directError;
      storedAlerts = directData || [];
    } else {
      storedAlerts = data || [];
    }
  } catch (dbError) {
    console.error('Database error:', dbError);
    // Continue execution even if database error occurs
    storedAlerts = [];
  }

  // Try to get real-time threat data as well
  let threatAlerts: Alert[] = [];
  try {
    const recentThreats = await threatService.getRecentThreats(userId);
    
    // Convert threat alerts to our Alert format
    threatAlerts = recentThreats.map(threat => ({
      id: threat.id,
      title: threat.title,
      description: threat.description,
      severity: convertThreatLevelToSeverity(threat.level),
      category: determineThreatCategory(threat),
      status: threat.resolved ? 'resolved' : 'active',
      createdAt: threat.created_at,
      userId: threat.user_id,
      actionText: threat.action || 'View Details'
    }));
  } catch (threatError) {
    console.error('Error fetching threat alerts:', threatError);
    // Continue execution even if threat fetching fails
    threatAlerts = [];
  }
  
  return { storedAlerts, threatAlerts };
};

// Function to update alert status
export const updateAlertStatus = async (alertId: string, status: AlertStatus, userId: string) => {
  // Try to update the alert in user_alerts table
  try {
    const { error } = await supabase
      .from('user_alerts')
      .update({ status })
      .eq('id', alertId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  } catch (dbError) {
    console.error('Database error updating alert:', dbError);
    
    // Try resolving it as a threat
    try {
      await threatService.resolveThreat(alertId, userId);
      return true;
    } catch (threatError) {
      console.error('Error updating threat status:', threatError);
      throw threatError;
    }
  }
};

// Helper functions
export const convertThreatLevelToSeverity = (level: 'low' | 'medium' | 'high'): Alert['severity'] => {
  switch (level) {
    case 'high': return 'critical';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'info';
  }
};

export const determineThreatCategory = (threat: any): AlertCategory => {
  if (threat.type === 'cyber') return 'cyber';
  if (threat.type === 'physical') return 'security';
  if (threat.type === 'environmental') return 'environmental';
  
  // Try to determine from the title or description
  const text = (threat.title + ' ' + threat.description).toLowerCase();
  if (text.includes('travel') || text.includes('advisory')) return 'travel';
  if (text.includes('family') || text.includes('check-in')) return 'family';
  if (text.includes('health') || text.includes('medical')) return 'health';
  
  return 'security';
};

// Demo data for development/testing
export const getDemoAlerts = (): Alert[] => [
  {
    id: 'demo-1',
    title: 'Low Body Temperature Detected',
    description: 'Low body temperature detected (94.7°F). This could indicate hypothermia or another medical emergency.',
    severity: 'critical',
    category: 'health',
    status: 'active',
    createdAt: new Date().toISOString(),
    userId: 'demo',
    actionText: 'View Details'
  },
  {
    id: 'demo-2',
    title: 'Travel Advisory Update',
    description: 'New travel advisory issued for your upcoming destination (Paris, France). Level 2: Exercise Increased Caution due to terrorism.',
    severity: 'warning',
    category: 'travel',
    status: 'active',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    userId: 'demo',
    actionText: 'View Advisory'
  },
  {
    id: 'demo-3',
    title: 'Family Check-in Reminder',
    description: 'Sarah hasn\'t checked in for 24 hours. Consider requesting a check-in to verify her status.',
    severity: 'info',
    category: 'family',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    userId: 'demo',
    actionText: 'Request Check-in'
  }
];
