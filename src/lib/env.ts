// Environment validation - Unified V2.0
declare global {
  interface ImportMetaEnv {
    readonly VITE_STRIPE_PUBLIC_KEY: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly MODE: 'development' | 'production' | 'preview';
  }
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Safe environment access
const getEnv = (key: string): string => {
  return import.meta.env[key as keyof ImportMetaEnv] ?? 
         (typeof process !== 'undefined' && process.env?.[key]) ?? 
         '';
};

export const isProduction = getEnv('MODE') === 'production';

export const requiredEnvVars = [
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_SUPABASE_URL', 
  'VITE_SUPABASE_ANON_KEY'
] as const;

export function validateEnv() {
  const missing: string[] = [];
  requiredEnvVars.forEach(key => {
    if (!getEnv(key)) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error(`❌ Missing env vars: ${missing.join(', ')}`);
    if (isProduction) {
      throw new Error(`Missing required env vars: ${missing.join(', ')}`);
    } else {
      console.warn(`⚠️  Missing env vars in development: ${missing.join(', ')}`);
    }
  }
}

// Run on app start
validateEnv();

export const STRIPE_PUBLIC_KEY = getEnv('VITE_STRIPE_PUBLIC_KEY');
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
