import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  MessageSquare,
  Plus,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  propertyTitle: string;
  propertyLocation: string;
  date: string;
  time: string;
  type: 'viewing' | 'consultation' | 'signing';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

const AppointmentScheduler: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  const appointments: Appointment[] = [
    {
      id: '1',
      clientName: 'Sarah Chen',
      clientPhone: '+62 812 3456 7890',
      clientEmail: 'sarah.chen@email.com',
      propertyTitle: 'Modern Villa Kemang',
      propertyLocation: 'Kemang, Jakarta Selatan',
      date: '2025-01-20',
      time: '10:00',
      type: 'viewing',
      status: 'confirmed',
      notes: 'Client interested in luxury properties',
      createdAt: '2025-01-18'
    },
    {
      id: '2',
      clientName: 'Ahmad Pratama',
      clientPhone: '+62 813 9876 5432',
      clientEmail: 'ahmad.pratama@email.com',
      propertyTitle: 'Luxury Apartment Senayan',
      propertyLocation: 'Senayan, Jakarta Pusat',
      date: '2025-01-20',
      time: '14:00',
      type: 'consultation',
      status: 'pending',
      notes: 'First-time buyer consultation',
      createdAt: '2025-01-19'
    },
    {
      id: '3',
      clientName: 'Lisa Wijaya',
      clientPhone: '+62 814 5555 1234',
      clientEmail: 'lisa.wijaya@email.com',
      propertyTitle: 'Contemporary House Bandung',
      propertyLocation: 'Dago, Bandung',
      date: '2025-01-21',
      time: '11:30',
      type: 'signing',
      status: 'confirmed',
      notes: 'Final contract signing',
      createdAt: '2025-01-17'
    }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesDate = appointment.date === selectedDate;
    return matchesSearch && matchesFilter && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'viewing': return 'bg-blue-100 text-blue-700';
      case 'consultation': return 'bg-purple-100 text-purple-700';
      case 'signing': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: string) => {
    // Handle status update
    console.log(`Updating appointment ${appointmentId} to ${newStatus}`);
  };

  const NewAppointmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-900">Schedule New Appointment</h3>
            <button
              onClick={() => setShowNewAppointment(false)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+62 xxx xxxx xxxx"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="client@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Appointment Type *
              </label>
              <select
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select type</option>
                <option value="viewing">Property Viewing</option>
                <option value="consultation">Consultation</option>
                <option value="signing">Contract Signing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Property
            </label>
            <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select property (optional)</option>
              <option value="1">Modern Villa Kemang</option>
              <option value="2">Luxury Apartment Senayan</option>
              <option value="3">Contemporary House Bandung</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setShowNewAppointment(false)}
              className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Schedule Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Appointment Scheduler</h2>
          <p className="text-sm text-neutral-600">Manage client appointments and viewings</p>
        </div>
        <button
          onClick={() => setShowNewAppointment(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search appointments..."
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-neutral-600">
            {filteredAppointments.length} appointments for {selectedDate}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center">
            <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No appointments scheduled</h3>
            <p className="text-neutral-600 mb-4">No appointments found for the selected date and filters.</p>
            <button
              onClick={() => setShowNewAppointment(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Schedule New Appointment
            </button>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-neutral-400" />
                      <span className="font-medium text-neutral-900">{appointment.time}</span>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                      {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)}
                    </div>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Client Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-700">{appointment.clientName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-700">{appointment.clientPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Property Details</h4>
                      <div className="space-y-2">
                        <div className="font-medium text-neutral-900">{appointment.propertyTitle}</div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-neutral-400" />
                          <span className="text-neutral-700">{appointment.propertyLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                      <p className="text-sm text-neutral-700">{appointment.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-6">
                  {appointment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Confirm"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Cancel"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && <NewAppointmentModal />}
    </div>
  );
};

export default AppointmentScheduler;