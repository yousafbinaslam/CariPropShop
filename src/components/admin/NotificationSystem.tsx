import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, Bell } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration (default 5 seconds)
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(onRemove, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`p-4 rounded-lg border shadow-lg ${getStyles()}`}>
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-neutral-900">
              {notification.title}
            </h4>
            <p className="text-sm text-neutral-600 mt-1">
              {notification.message}
            </p>
            {notification.action && (
              <button
                onClick={notification.action.onClick}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {notification.action.label}
              </button>
            )}
          </div>
          <button
            onClick={handleRemove}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Real-time notification system with proper WebSocket handling
export const useRealTimeNotifications = () => {
  const { addNotification } = useNotifications();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      try {
        // Use the correct WebSocket URL for the environment
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3002';
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connected successfully');
          setIsConnected(true);
          
          // Send ping to verify connection
          ws?.send(JSON.stringify({ type: 'ping' }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case 'connection-established':
                console.log('Connection established:', data.message);
                break;
                
              case 'real-time-event':
                if (data.event) {
                  const { event } = data;
                  addNotification({
                    type: event.severity === 'error' || event.severity === 'critical' ? 'error' :
                          event.severity === 'warning' ? 'warning' : 'info',
                    title: 'System Event',
                    message: event.data.message,
                    duration: 3000
                  });
                }
                break;
                
              case 'alert':
                if (data.alert) {
                  addNotification({
                    type: data.alert.severity === 'critical' || data.alert.severity === 'high' ? 'error' : 'warning',
                    title: 'System Alert',
                    message: data.alert.message,
                    persistent: true
                  });
                }
                break;
                
              case 'pong':
                // Keep-alive response
                break;
                
              default:
                console.log('Unknown WebSocket message type:', data.type);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.reason);
          setIsConnected(false);
          
          // Reconnect after delay if not intentionally closed
          if (event.code !== 1000) {
            reconnectTimeout = setTimeout(connectWebSocket, 5000);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setIsConnected(false);
        
        // Retry connection
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      }
    };

    // Initial connection
    connectWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [addNotification]);

  return { isConnected };
};

// Notification Bell Component with connection status
export const NotificationBell: React.FC = () => {
  const { notifications, clearAll } = useNotifications();
  const { isConnected } = useRealTimeNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const unreadCount = notifications.filter(n => n.persistent).length;

  const getIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 transition-colors duration-200 ${
          isConnected 
            ? 'text-neutral-600 hover:text-neutral-900' 
            : 'text-red-600 hover:text-red-700'
        }`}
        title={isConnected ? 'Real-time notifications active' : 'Real-time notifications disconnected'}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {!isConnected && (
          <span className="absolute -bottom-1 -right-1 bg-red-500 w-3 h-3 rounded-full"></span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900">Notifikasi</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-neutral-500">
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="p-4 border-b border-neutral-100 hover:bg-neutral-50">
                  <div className="flex items-start space-x-3">
                    {getIcon(notification)}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-neutral-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-neutral-600 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {!isConnected && (
            <div className="p-3 bg-red-50 border-t border-red-200">
              <p className="text-sm text-red-700">
                Real-time notifications disconnected. Attempting to reconnect...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};