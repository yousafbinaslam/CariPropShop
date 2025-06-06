import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        'Authorization': `Bearer ${session.access_token}`
      })
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers,
        ...options,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Properties API
  async getProperties(params?: {
    type?: string;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';
    
    return this.request(`/properties${queryString}`);
  }

  async getProperty(id: string) {
    return this.request(`/properties/${id}`);
  }

  async createProperty(data: any) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProperty(id: string, data: any) {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Clients API
  async getClients(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';
    
    return this.request(`/clients${queryString}`);
  }

  async getClient(id: string) {
    return this.request(`/clients/${id}`);
  }

  async createClient(data: any) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: any) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointments API
  async getAppointments(params?: {
    status?: string;
    type?: string;
    date?: string;
    client_id?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';
    
    return this.request(`/appointments${queryString}`);
  }

  async getAppointment(id: string) {
    return this.request(`/appointments/${id}`);
  }

  async createAppointment(data: any) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointmentStatus(id: string, status: string) {
    return this.request(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateAppointment(id: string, data: any) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(id: string) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Payments API
  async getPayments(params?: {
    status?: string;
    method?: string;
    client_id?: string;
    page?: number;
    limit?: number;
  }) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';
    
    return this.request(`/payments${queryString}`);
  }

  async getPayment(id: string) {
    return this.request(`/payments/${id}`);
  }

  async createPayment(data: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentStatus(id: string, status: string) {
    return this.request(`/payments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getPaymentAnalytics() {
    return this.request('/payments/analytics/summary');
  }

  // Analytics API
  async getAnalytics(type: string, params?: any) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString() : '';
    
    return this.request(`/analytics/${type}${queryString}`);
  }

  // File Upload API
  async uploadFiles(files: FileList) {
    try {
      const headers = await this.getAuthHeaders();
      delete headers['Content-Type']; // Let browser set content-type for FormData

      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': headers.Authorization || ''
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      return result;
    } catch (error) {
      console.error('Upload Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();