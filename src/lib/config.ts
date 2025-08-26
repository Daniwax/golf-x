// Application configuration
export const config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Feature flags
  features: {
    debugTools: import.meta.env.DEV, // Only show in development
    mockData: false, // Set to true to use mock data
    analytics: import.meta.env.PROD, // Only in production
  }
};

// Type guard for development environment
export const isDev = () => config.isDevelopment;

// Type guard for production environment  
export const isProd = () => config.isProduction;

// Type guard for debug features
export const isDebugEnabled = () => config.features.debugTools;