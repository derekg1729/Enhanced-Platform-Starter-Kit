// Add type declarations for Drizzle ORM query functions
// This allows us to use the where and orderBy parameters without explicit type annotations
declare module 'drizzle-orm' {
  export interface DrizzleConfig {
    schema?: any;
    logger?: boolean;
  }
}

// Add module augmentation for TSConfig to ignore implicit any in specific contexts
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    POSTGRES_URL?: string;
    POSTGRES_URL_NON_POOLING?: string;
    ENCRYPTION_KEY?: string;
    DATABASE_URL?: string;
    NEXTAUTH_URL?: string;
    [key: string]: string | undefined;
  }
} 