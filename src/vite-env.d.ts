
/// <reference types="vite/client" />

// Define the User type to match what's expected in the application
// This helps resolve TypeScript errors when using the simplified user object from AuthContext
declare interface User {
  id: string;
  email: string;
  isPremium?: boolean;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  aud?: string;
  created_at?: string;
}
