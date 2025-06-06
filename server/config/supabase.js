import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database helper functions
export const dbHelpers = {
  // Generic CRUD operations
  async create(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async read(table, filters = {}, options = {}) {
    let query = supabase.from(table).select(options.select || '*');
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value);
      }
    });

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending !== false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  // Search functionality
  async search(table, searchTerm, searchFields = ['title', 'name', 'description']) {
    let query = supabase.from(table).select('*');
    
    if (searchTerm && searchFields.length > 0) {
      const searchConditions = searchFields.map(field => `${field}.ilike.%${searchTerm}%`);
      query = query.or(searchConditions.join(','));
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Analytics queries
  async getAnalytics(table, aggregations = {}) {
    let query = supabase.from(table);

    if (aggregations.count) {
      query = query.select('*', { count: 'exact', head: true });
    } else {
      query = query.select('*');
    }

    const { data, error, count } = await query;
    if (error) throw error;
    
    return {
      data,
      count,
      ...aggregations
    };
  }
};