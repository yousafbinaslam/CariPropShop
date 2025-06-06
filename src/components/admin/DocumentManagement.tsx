import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Share2,
  Lock,
  Unlock,
  Calendar,
  User,
  Building,
  Tag,
  Archive,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'certificate' | 'permit' | 'report' | 'image' | 'video' | 'other';
  category: 'property' | 'client' | 'legal' | 'financial' | 'marketing';
  size: string;
  uploadDate: string;
  lastModified: string;
  uploadedBy: string;
  propertyId?: string;
  clientId?: string;
  status: 'active' | 'archived' | 'expired' | 'pending';
  isProtected: boolean;
  isFavorite: boolean;
  tags: string[];
  version: number;
  description?: string;
}

const DocumentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  const documents: Document[] = [
    {
      id: '1',
      name: 'Property_Sale_Agreement_Villa_Kemang.pdf',
      type: 'contract',
      category: 'legal',
      size: '2.4 MB',
      uploadDate: '2025-01-15',
      lastModified: '2025-01-18',
      uploadedBy: 'Sarah Chen',
      propertyId: 'PROP-001',
      clientId: 'CLIENT-001',
      status: 'active',
      isProtected: true,
      isFavorite: true,
      tags: ['contract', 'villa', 'kemang'],
      version: 3,
      description: 'Final sale agreement for Villa Kemang project'
    },
    {
      id: '2',
      name: 'Building_Permit_SCBD_Office.pdf',
      type: 'permit',
      category: 'legal',
      size: '1.8 MB',
      uploadDate: '2025-01-12',
      lastModified: '2025-01-12',
      uploadedBy: 'Ahmad Pratama',
      propertyId: 'PROP-002',
      status: 'pending',
      isProtected: true,
      isFavorite: false,
      tags: ['permit', 'office', 'scbd'],
      version: 1,
      description: 'Building permit application for SCBD office space'
    },
    {
      id: '3',
      name: 'Property_Photos_Bali_Villa.zip',
      type: 'image',
      category: 'marketing',
      size: '45.2 MB',
      uploadDate: '2025-01-10',
      lastModified: '2025-01-16',
      uploadedBy: 'Lisa Wijaya',
      propertyId: 'PROP-003',
      status: 'active',
      isProtected: false,
      isFavorite: true,
      tags: ['photos', 'villa', 'bali', 'marketing'],
      version: 2,
      description: 'High-resolution photos for Bali villa listing'
    },
    {
      id: '4',
      name: 'Client_Profile_John_Doe.pdf',
      type: 'report',
      category: 'client',
      size: '856 KB',
      uploadDate: '2025-01-08',
      lastModified: '2025-01-14',
      uploadedBy: 'David Tan',
      clientId: 'CLIENT-002',
      status: 'active',
      isProtected: true,
      isFavorite: false,
      tags: ['client', 'profile', 'vip'],
      version: 1,
      description: 'Comprehensive client profile and preferences'
    },
    {
      id: '5',
      name: 'Financial_Report_Q1_2025.xlsx',
      type: 'report',
      category: 'financial',
      size: '3.1 MB',
      uploadDate: '2025-01-05',
      lastModified: '2025-01-19',
      uploadedBy: 'Finance Team',
      status: 'active',
      isProtected: true,
      isFavorite: true,
      tags: ['financial', 'quarterly', 'report'],
      version: 4,
      description: 'Q1 2025 financial performance report'
    }
  ];

  const documentTypes = [
    { key: 'all', label: 'All Types' },
    { key: 'contract', label: 'Contracts' },
    { key: 'certificate', label: 'Certificates' },
    { key: 'permit', label: 'Permits' },
    { key: 'report', label: 'Reports' },
    { key: 'image', label: 'Images' },
    { key: 'video', label: 'Videos' },
    { key: 'other', label: 'Other' }
  ];

  const documentCategories = [
    { key: 'all', label: 'All Categories' },
    { key: 'property', label: 'Property' },
    { key: 'client', label: 'Client' },
    { key: 'legal', label: 'Legal' },
    { key: 'financial', label: 'Financial' },
    { key: 'marketing', label: 'Marketing' }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-700 border-red-200';
      case 'archived': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contract': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'certificate': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'permit': return <Shield className="w-5 h-5 text-purple-600" />;
      case 'report': return <BarChart3 className="w-5 h-5 text-orange-600" />;
      case 'image': return <Image className="w-5 h-5 text-pink-600" />;
      case 'video': return <Video className="w-5 h-5 text-red-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const toggleDocumentSelection = (docId: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocuments(newSelection);
  };

  const toggleFavorite = (docId: string) => {
    // Handle favorite toggle
    console.log(`Toggle favorite for document ${docId}`);
  };

  const bulkActions = [
    { label: 'Download Selected', icon: <Download className="w-4 h-4" />, action: 'download' },
    { label: 'Archive Selected', icon: <Archive className="w-4 h-4" />, action: 'archive' },
    { label: 'Delete Selected', icon: <Trash2 className="w-4 h-4" />, action: 'delete' },
    { label: 'Share Selected', icon: <Share2 className="w-4 h-4" />, action: 'share' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Document Management</h2>
          <p className="text-sm text-neutral-600">Organize and manage all property-related documents</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          <Upload className="w-4 h-4" />
          <span>Upload Documents</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {documentTypes.map(type => (
                <option key={type.key} value={type.key}>{type.label}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {documentCategories.map(category => (
                <option key={category.key} value={category.key}>{category.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDocuments.size > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                {selectedDocuments.size} document(s) selected
              </span>
              <div className="flex items-center space-x-2">
                {bulkActions.map((action, index) => (
                  <button
                    key={index}
                    className="flex items-center space-x-1 px-3 py-1 bg-white text-blue-700 border border-blue-300 rounded text-sm hover:bg-blue-50 transition-colors duration-200"
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">{documents.length}</div>
              <div className="text-sm text-neutral-600">Total Documents</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <Lock className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">
                {documents.filter(d => d.isProtected).length}
              </div>
              <div className="text-sm text-neutral-600">Protected</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-amber-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">
                {documents.filter(d => d.isFavorite).length}
              </div>
              <div className="text-sm text-neutral-600">Favorites</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">
                {documents.filter(d => d.status === 'pending').length}
              </div>
              <div className="text-sm text-neutral-600">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">
                    <input
                      type="checkbox"
                      className="rounded border-neutral-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocuments(new Set(filteredDocuments.map(d => d.id)));
                        } else {
                          setSelectedDocuments(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Document</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Size</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Modified</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-neutral-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-neutral-300"
                        checked={selectedDocuments.has(doc.id)}
                        onChange={() => toggleDocumentSelection(doc.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(doc.type)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-neutral-900">{doc.name}</span>
                            {doc.isProtected && <Lock className="w-3 h-3 text-neutral-500" />}
                            {doc.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-current" />}
                          </div>
                          <div className="text-sm text-neutral-500">v{doc.version} • {doc.uploadedBy}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm text-neutral-700">{doc.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm text-neutral-700">{doc.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-700">{doc.size}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-700">{doc.lastModified}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-neutral-600 hover:text-blue-600 transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-neutral-600 hover:text-green-600 transition-colors duration-200">
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleFavorite(doc.id)}
                          className="p-1 text-neutral-600 hover:text-amber-600 transition-colors duration-200"
                        >
                          <Star className={`w-4 h-4 ${doc.isFavorite ? 'fill-current text-amber-500' : ''}`} />
                        </button>
                        <button className="p-1 text-neutral-600 hover:text-red-600 transition-colors duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(doc.type)}
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300"
                    checked={selectedDocuments.has(doc.id)}
                    onChange={() => toggleDocumentSelection(doc.id)}
                  />
                </div>
                <div className="flex items-center space-x-1">
                  {doc.isProtected && <Lock className="w-3 h-3 text-neutral-500" />}
                  {doc.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-current" />}
                </div>
              </div>
              
              <h4 className="font-medium text-neutral-900 mb-2 line-clamp-2">{doc.name}</h4>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Type:</span>
                  <span className="capitalize text-neutral-700">{doc.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Size:</span>
                  <span className="text-neutral-700">{doc.size}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {doc.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {doc.tags.length > 3 && (
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded">
                    +{doc.tags.length - 3}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">{doc.lastModified}</span>
                <div className="flex items-center space-x-1">
                  <button className="p-1 text-neutral-600 hover:text-blue-600 transition-colors duration-200">
                    <Eye className="w-3 h-3" />
                  </button>
                  <button className="p-1 text-neutral-600 hover:text-green-600 transition-colors duration-200">
                    <Download className="w-3 h-3" />
                  </button>
                  <button className="p-1 text-neutral-600 hover:text-red-600 transition-colors duration-200">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;