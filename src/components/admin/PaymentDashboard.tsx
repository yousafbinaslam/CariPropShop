import React, { useState } from 'react';
import { 
  CreditCard, 
  Wallet, 
  Building2, 
  QrCode,
  TrendingUp,
  Download,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';

interface Payment {
  id: string;
  clientName: string;
  propertyTitle: string;
  amount: number;
  method: 'bank_transfer' | 'e_wallet' | 'credit_card' | 'qris';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: string;
  transactionId: string;
  description: string;
}

const PaymentDashboard: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const payments: Payment[] = [
    {
      id: '1',
      clientName: 'Sarah Chen',
      propertyTitle: 'Modern Villa Kemang',
      amount: 50000000,
      method: 'bank_transfer',
      status: 'completed',
      date: '2025-01-19',
      transactionId: 'TXN-2025-001',
      description: 'Booking fee for property viewing'
    },
    {
      id: '2',
      clientName: 'Ahmad Pratama',
      propertyTitle: 'Luxury Apartment Senayan',
      amount: 25000000,
      method: 'e_wallet',
      status: 'pending',
      date: '2025-01-19',
      transactionId: 'TXN-2025-002',
      description: 'Consultation fee'
    },
    {
      id: '3',
      clientName: 'Lisa Wijaya',
      propertyTitle: 'Contemporary House Bandung',
      amount: 100000000,
      method: 'credit_card',
      status: 'completed',
      date: '2025-01-18',
      transactionId: 'TXN-2025-003',
      description: 'Down payment'
    },
    {
      id: '4',
      clientName: 'David Tan',
      propertyTitle: 'Premium Land Plot Bali',
      amount: 15000000,
      method: 'qris',
      status: 'failed',
      date: '2025-01-18',
      transactionId: 'TXN-2025-004',
      description: 'Service fee'
    }
  ];

  const paymentMethods = [
    { key: 'bank_transfer', label: 'Bank Transfer', icon: <Building2 className="w-5 h-5" />, color: 'blue' },
    { key: 'e_wallet', label: 'E-Wallet', icon: <Wallet className="w-5 h-5" />, color: 'green' },
    { key: 'credit_card', label: 'Credit Card', icon: <CreditCard className="w-5 h-5" />, color: 'purple' },
    { key: 'qris', label: 'QRIS', icon: <QrCode className="w-5 h-5" />, color: 'orange' }
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const completedCount = payments.filter(p => p.status === 'completed').length;
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    const methodConfig = paymentMethods.find(m => m.key === method);
    return methodConfig ? `text-${methodConfig.color}-600` : 'text-gray-600';
  };

  const PaymentDetailModal = ({ payment, onClose }: { payment: Payment; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-neutral-900">Payment Details</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Info */}
          <div className="bg-neutral-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-neutral-900">{formatCurrency(payment.amount)}</h4>
                <p className="text-sm text-neutral-600">Transaction ID: {payment.transactionId}</p>
              </div>
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                {getStatusIcon(payment.status)}
                <span>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
              </div>
            </div>
          </div>

          {/* Client & Property Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-3">Client Information</h4>
              <div className="space-y-2">
                <p className="text-neutral-700"><span className="font-medium">Name:</span> {payment.clientName}</p>
                <p className="text-neutral-700"><span className="font-medium">Date:</span> {payment.date}</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-neutral-900 mb-3">Property</h4>
              <p className="text-neutral-700">{payment.propertyTitle}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-3">Payment Method</h4>
            <div className="flex items-center space-x-3">
              {paymentMethods.find(m => m.key === payment.method)?.icon}
              <span className="text-neutral-700">{paymentMethods.find(m => m.key === payment.method)?.label}</span>
            </div>
          </div>

          {/* Bank Account Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-900 mb-3">Bank Account Details</h4>
            <div className="space-y-2">
              <p className="text-blue-800"><span className="font-medium">Bank:</span> BCA (Bank Central Asia)</p>
              <p className="text-blue-800"><span className="font-medium">Account Number:</span> 6100134754</p>
              <p className="text-blue-800"><span className="font-medium">Account Name:</span> Cari Prop Shop</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-lg font-semibold text-neutral-900 mb-3">Description</h4>
            <p className="text-neutral-700">{payment.description}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-neutral-200">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Download Receipt</span>
            </button>
            {payment.status === 'pending' && (
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                <CheckCircle className="w-4 h-4" />
                <span>Mark as Paid</span>
              </button>
            )}
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
          <h2 className="text-2xl font-bold text-neutral-900">Payment Dashboard</h2>
          <p className="text-sm text-neutral-600">Monitor and manage payment transactions</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment Methods</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {paymentMethods.map((method) => {
            const methodPayments = payments.filter(p => p.method === method.key && p.status === 'completed');
            const methodTotal = methodPayments.reduce((sum, p) => sum + p.amount, 0);
            return (
              <div key={method.key} className="p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`text-${method.color}-600`}>{method.icon}</div>
                  <span className="font-medium text-neutral-900">{method.label}</span>
                </div>
                <p className="text-sm text-neutral-600">{formatCurrency(methodTotal)}</p>
                <p className="text-xs text-neutral-500">{methodPayments.length} transactions</p>
              </div>
            );
          })}
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
                placeholder="Search payments..."
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Methods</option>
              {paymentMethods.map(method => (
                <option key={method.key} value={method.key}>{method.label}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-neutral-600">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Transaction</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Client</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Property</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Method</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-neutral-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-neutral-900">{payment.transactionId}</div>
                      <div className="text-sm text-neutral-500">{payment.date}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{payment.clientName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-neutral-900">{payment.propertyTitle}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{formatCurrency(payment.amount)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={getMethodColor(payment.method)}>
                        {paymentMethods.find(m => m.key === payment.method)?.icon}
                      </div>
                      <span className="text-sm text-neutral-700">
                        {paymentMethods.find(m => m.key === payment.method)?.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="p-2 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};

export default PaymentDashboard;