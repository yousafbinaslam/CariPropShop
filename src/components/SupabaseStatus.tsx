import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

const SupabaseStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test the connection by making a simple query
      const { data, error } = await supabase
        .from('properties')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      setIsConnected(true);
    } catch (err) {
      console.error('Supabase connection error:', err);
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
        <Database className="w-4 h-4 text-blue-600 animate-pulse" />
        <span className="text-sm text-blue-700">Menghubungkan ke Supabase...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <Wifi className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-700">Supabase Terhubung</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-600" />
        <WifiOff className="w-4 h-4 text-red-600" />
        <span className="text-sm text-red-700">Koneksi Supabase Gagal</span>
      </div>
      {error && (
        <div className="px-3 py-2 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
      <button
        onClick={checkConnection}
        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
      >
        Coba Lagi Koneksi
      </button>
    </div>
  );
};

export default SupabaseStatus;