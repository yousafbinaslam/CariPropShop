import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types will be generated here
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          location: string
          type: 'residential' | 'commercial' | 'industrial' | 'land'
          bedrooms?: number
          bathrooms?: number
          area: number
          images: string[]
          featured: boolean
          virtual_360: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          location: string
          type: 'residential' | 'commercial' | 'industrial' | 'land'
          bedrooms?: number
          bathrooms?: number
          area: number
          images?: string[]
          featured?: boolean
          virtual_360?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          location?: string
          type?: 'residential' | 'commercial' | 'industrial' | 'land'
          bedrooms?: number
          bathrooms?: number
          area?: number
          images?: string[]
          featured?: boolean
          virtual_360?: boolean
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          location: string
          preferences: string[]
          status: 'active' | 'inactive' | 'vip'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          location: string
          preferences?: string[]
          status?: 'active' | 'inactive' | 'vip'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          location?: string
          preferences?: string[]
          status?: 'active' | 'inactive' | 'vip'
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          property_id?: string
          date: string
          time: string
          type: 'viewing' | 'consultation' | 'signing'
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_id?: string
          date: string
          time: string
          type: 'viewing' | 'consultation' | 'signing'
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_id?: string
          date?: string
          time?: string
          type?: 'viewing' | 'consultation' | 'signing'
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          client_id: string
          property_id?: string
          amount: number
          method: 'bank_transfer' | 'e_wallet' | 'credit_card' | 'qris'
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          transaction_id: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_id?: string
          amount: number
          method: 'bank_transfer' | 'e_wallet' | 'credit_card' | 'qris'
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          transaction_id: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_id?: string
          amount?: number
          method?: 'bank_transfer' | 'e_wallet' | 'credit_card' | 'qris'
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          transaction_id?: string
          description?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}