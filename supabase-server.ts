import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { User, Lesson, Tournament, ForumPost, StoreItem } from './src/types';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    })
  : null;

interface DatabaseSchema {
  users: User[];
  lessons: Lesson[];
  storeItems: StoreItem[];
  tournaments: Tournament[];
  posts: ForumPost[];
  broadcastMessages: string[];
}

/**
 * Fetch database schema from Supabase.
 * We store the state under a single table structure for maximum compatibility
 * without forcing complex SQL schema creations on the user.
 */
export async function fetchSupabaseDb(): Promise<DatabaseSchema | null> {
  if (!supabase) return null;

  try {
    // Check if the 'dojo_state' table has our settings
    const { data, error } = await supabase
      .from('dojo_state')
      .select('data')
      .eq('key', 'main_data')
      .single();

    if (error) {
      // If table doesn't exist, this is fine, we will handle and let writeDb create it or fallback
      console.warn('Supabase fetched table error (it might not be created yet):', error.message);
      return null;
    }

    if (data && data.data) {
      // Parse data if it is stored as serialised string or object
      const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      return parsed as DatabaseSchema;
    }
  } catch (err) {
    console.error('Failed to read from Supabase:', err);
  }

  return null;
}

/**
 * Save database schema to Supabase under the main_data key.
 */
export async function saveSupabaseDb(data: DatabaseSchema): Promise<boolean> {
  if (!supabase) return false;

  try {
    // Try to write to Supabase
    const { error } = await supabase
      .from('dojo_state')
      .upsert({
        key: 'main_data',
        data: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.warn('Supabase upsert errored (table might need creation):', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to save to Supabase:', err);
    return false;
  }
}
