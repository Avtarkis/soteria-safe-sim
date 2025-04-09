
// This file now just re-exports from the contexts/AuthContext.tsx file
// for backward compatibility with existing imports

import { useAuth as useAuthOriginal, AuthProvider } from '@/contexts/AuthContext';

// Re-export the hooks and provider
export const useAuth = useAuthOriginal;
export { AuthProvider };

// Add an alias for backward compatibility
export const useAuthContext = useAuthOriginal;
