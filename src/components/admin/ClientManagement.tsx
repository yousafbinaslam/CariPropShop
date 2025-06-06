import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Phone, 
  Mail,
  Calendar,
  MapPin,
  Star,
  MoreVertical,
  Plus,
  Download
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  totalInquiries: number;
  totalAppointments: number;
  totalPayments: number;
  status: 'active' | 'inactive' | 'vip';
  preferences: string[];
  lastActivity: string;
  avatar?: string;
}

const ClientManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const clients: Client[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      phone: '+62 812 3456 7890',
      location: 'Jakarta Selatan',
      joinDate: '2024-01-15',
      totalInquiries: 12,
      totalAppointments: 5,
      totalPayments: 2,
      status: 'vip',
      preferences: ['Modern', 'Luxury', 'High-rise'],
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      name: 'Ahmad Pratama',
      email: 'ahmad.pratama@email.com',
      phone: '+62 813 9876 5432',
      location: 'Bandung',
      joinDate: '2024-02-20',
      totalInquiries: 8,
      totalAppointments: 3,
      totalPayments: 1,
      status: 'active',
      preferences: ['Traditional', 'Family-friendly'],
      lastActivity: '1 day ago'
    },
    {
      id: '3',
      name: 'Lisa Wijaya',
      email: 'lisa.wijaya@email.com',
      phone: '+62 814 5555 1234',
      location: 'Surabaya',
      joinDate: '2024-03-10',
      totalInquiries: 15,
      totalAppointments: 7,
      totalPayments: 3,
      status: 'vip',
      preferences: ['Contemporary', 'Waterfront', 'Investment'],
      lastActivity: '30 minutes ago'
    },
    {
      id: '4',
      name: 'David Tan',
      email: 'david.tan@email.com',
      phone: '+62 815 7777 8888',
      location: 'Bali',
      joinDate: '2024-01-05',
      totalInquiries: 6,
      totalAppointments: 2,
      totalPayments: 0,
      status: 'inactive',
      preferences: ['Villa', 'Resort-style'],
      lastActivity: '1 week ago'
    }
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const ClientDetailModal = ({ client, onClose }: { client: Client; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">{client.name}</h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                  {client.status.toUpperCase()}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-700">{client.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-700">{client.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-700">{client.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-700">Joined {client.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Activity Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{client.totalInquiries}</div>
                <div className="text-sm text-blue-700">Inquiries</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{client.totalAppointments}</div>
                <div className="text-sm text-green-700">Appointments</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{client.totalPayments}</div>
                <div className="text-sm text-purple-700">Payments</div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Preferences</h4>
            <div className="flex flex-wrap gap-2">
              {client.preferences.map((pref, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-neutral-200">
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
              <Calendar className="w-4 h-4" />
              <span>Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Client Management</h2>
          <p className="text-sm text-neutral-600">Manage and track client interactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="vip">VIP</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="text-sm text-neutral-600">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Client</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Location</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Activity</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-neutral-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {client.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{client.name}</div>
                        <div className="text-sm text-neutral-500">Joined {client.joinDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900">{client.email}</div>
                    <div className="text-sm text-neutral-500">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-700">{client.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900">{client.totalInquiries} inquiries</div>
                    <div className="text-sm text-neutral-500">Last: {client.lastActivity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                      {client.status === 'vip' && <Star className="w-3 h-3 mr-1" />}
                      {client.status.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

export default ClientManagement;