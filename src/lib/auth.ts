
import { supabase } from '@/integrations/supabase/client';

/**
 * Function to get user by ID
 * This is a workaround since we can't directly query auth.users
 */
export async function getUserById(userId: string) {
  // In development mode, we'll simulate this by returning a placeholder
  // In production, you would have a profiles table linked to auth.users
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error) {
      console.error('Error getting user:', error);
      return { email: 'Unknown' };
    }
    
    return {
      id: data.user.id,
      email: data.user.email
    };
  } catch (error) {
    console.error('Error in getUserById:', error);
    return { email: 'Unknown' };
  }
}

/**
 * Get multiple users by their IDs
 * @param userIds Array of user IDs
 * @returns Map of user IDs to user objects
 */
export async function getUsersByIds(userIds: string[]) {
  const userMap: Record<string, { email: string }> = {};
  
  // In a real application with a profiles table, you'd query that table
  // For now, we'll query each user individually
  for (const userId of userIds) {
    try {
      const user = await getUserById(userId);
      userMap[userId] = user;
    } catch (error) {
      console.error(`Error getting user ${userId}:`, error);
      userMap[userId] = { email: 'Unknown' };
    }
  }
  
  return userMap;
}
