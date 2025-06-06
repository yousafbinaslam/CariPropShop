import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Tables = Database['public']['Tables']

// Properties hook
export function useProperties() {
  const [properties, setProperties] = useState<Tables['properties']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProperties(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addProperty = async (property: Tables['properties']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select()

      if (error) throw error
      if (data) {
        setProperties(prev => [data[0], ...prev])
      }
      return { success: true, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add property')
      return { success: false, error: err }
    }
  }

  const updateProperty = async (id: string, updates: Tables['properties']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        setProperties(prev => prev.map(p => p.id === id ? data[0] : p))
      }
      return { success: true, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update property')
      return { success: false, error: err }
    }
  }

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProperties(prev => prev.filter(p => p.id !== id))
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete property')
      return { success: false, error: err }
    }
  }

  return {
    properties,
    loading,
    error,
    addProperty,
    updateProperty,
    deleteProperty,
    refetch: fetchProperties
  }
}

// Clients hook
export function useClients() {
  const [clients, setClients] = useState<Tables['clients']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addClient = async (client: Tables['clients']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()

      if (error) throw error
      if (data) {
        setClients(prev => [data[0], ...prev])
      }
      return { success: true, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add client')
      return { success: false, error: err }
    }
  }

  const updateClient = async (id: string, updates: Tables['clients']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        setClients(prev => prev.map(c => c.id === id ? data[0] : c))
      }
      return { success: true, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client')
      return { success: false, error: err }
    }
  }

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    refetch: fetchClients
  }
}

// Appointments hook
export function useAppointments() {
  const [appointments, setAppointments] = useState<Tables['appointments']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients(name, phone, email),
          properties(title, location)
        `)
        .order('date', { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addAppointment = async (appointment: Tables['appointments']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()

      if (error) throw error
      if (data) {
        await fetchAppointments() // Refetch to get joined data
      }
      return { success: true, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add appointment')
      return { success: false, error: err }
    }
  }

  const updateAppointment = async (id: string, updates: Tables['appointments']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        await fetchAppointments() // Refetch to get updated joined data
      }
      return { success: true, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment')
      return { success: false, error: err }
    }
  }

  return {
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    refetch: fetchAppointments
  }
}

// Payments hook
export function usePayments() {
  const [payments, setPayments] = useState<Tables['payments']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients(name, phone, email),
          properties(title, location)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addPayment = async (payment: Tables['payments']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()

      if (error) throw error
      if (data) {
        await fetchPayments() // Refetch to get joined data
      }
      return { success: true, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payment')
      return { success: false, error: err }
    }
  }

  const updatePayment = async (id: string, updates: Tables['payments']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        await fetchPayments() // Refetch to get updated joined data
      }
      return { success: true, data }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment')
      return { success: false, error: err }
    }
  }

  return {
    payments,
    loading,
    error,
    addPayment,
    updatePayment,
    refetch: fetchPayments
  }
}