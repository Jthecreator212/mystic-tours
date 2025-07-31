import { supabaseAdmin } from '@/lib/supabase/supabase';
import { SupabaseError } from '@supabase/supabase-js';

export interface DatabaseQueryOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
}

export class DatabaseOperations {
  static async getAll<T>(
    table: string,
    options: DatabaseQueryOptions = {}
  ): Promise<{ data: T[] | null; error: SupabaseError | null; count?: number }> {
    try {
      let query = supabaseAdmin.from(table).select(options.select || '*');

      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? false
        });
      }

      if (options.limit) {
        query = query.range(options.offset || 0, (options.offset || 0) + options.limit - 1);
      }

      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error, count } = await query;
      return { data, error, count };
    } catch (error) {
      console.error(`Database getAll error for table ${table}:`, error);
      return { data: null, error: error as SupabaseError };
    }
  }

  static async getById<T>(
    table: string,
    id: string | number,
    select?: string
  ): Promise<{ data: T | null; error: SupabaseError | null }> {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select(select || '*')
        .eq('id', id)
        .single();

      return { data, error };
    } catch (error) {
      console.error(`Database getById error for table ${table}:`, error);
      return { data: null, error: error as SupabaseError };
    }
  }

  static async create<T>(
    table: string,
    data: Record<string, unknown>
  ): Promise<{ data: T | null; error: SupabaseError | null }> {
    try {
      const { data: result, error } = await supabaseAdmin
        .from(table)
        .insert([data])
        .select()
        .single();

      return { data: result, error };
    } catch (error) {
      console.error(`Database create error for table ${table}:`, error);
      return { data: null, error: error as SupabaseError };
    }
  }

  static async update<T>(
    table: string,
    id: string | number,
    data: Record<string, unknown>
  ): Promise<{ data: T | null; error: SupabaseError | null }> {
    try {
      const { data: result, error } = await supabaseAdmin
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      return { data: result, error };
    } catch (error) {
      console.error(`Database update error for table ${table}:`, error);
      return { data: null, error: error as SupabaseError };
    }
  }

  static async delete(
    table: string,
    id: string | number
  ): Promise<{ error: SupabaseError | null }> {
    try {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error(`Database delete error for table ${table}:`, error);
      return { error: error as SupabaseError };
    }
  }

  static async count(
    table: string,
    filters?: Record<string, unknown>
  ): Promise<{ count: number | null; error: SupabaseError | null }> {
    try {
      let query = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { count, error } = await query;
      return { count, error };
    } catch (error) {
      console.error(`Database count error for table ${table}:`, error);
      return { count: null, error: error as SupabaseError };
    }
  }
} 