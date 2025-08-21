import { createRouteHandler } from './server';
import type { Database } from './database.types';

// Type-safe database operations
export type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

// Type-safe client wrapper
export async function createTypedClient() {
  const supabase = await createRouteHandler();
  
  return {
    auth: supabase.auth,
    from: (table: 'user_profiles') => ({
      select: (query: string) => ({
        eq: (column: 'id', value: string) => ({
          single: () => supabase
            .from(table)
            .select(query)
            .eq(column, value)
            .single()
        })
      }),
      update: (data: UserProfileUpdate) => ({
        eq: (column: 'id', value: string) => 
          supabase
            .from(table)
            .update(data)
            .eq(column, value)
      })
    })
  };
}
