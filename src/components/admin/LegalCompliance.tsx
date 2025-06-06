import React, { useState } from 'react';
import { Shield, FileText, CheckCircle, AlertTriangle, Download, Upload, FileSignature as Signature, Calendar, User, Building, Scale, Gavel, Clock, Eye, Edit, Trash2 } from 'lucide-react';

interface LegalDocument {
  id: string;
  title: string;
  type: 'contract' | 'certificate' | 'permit' | 'agreement' | 'notaris';
  status: 'draft' | 'pending' | 'approved' | 'expired' | 'rejected';
  propertyId?: string;
  clientId?: string;
  notarisId?: string;
  createdDate: string;
  expiryDate?: string;
  digitalSignature: boolean;
  complianceScore: number;
}

interface NotarisProfile {
  id: string;
  name: string;
  license: string;
  location: string;
  specialization: string[];
  rating: number;
  availability: 'available' | 'busy' | 'unavailable';
  contact: string;
}

const LegalCompliance: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);

  const legalDocuments: LegalDocument[] = [
    {
      id: '1',
      title: 'Property Sale Agreement - Villa Kemang',
      type: 'contract',
      status: 'approved',
      propertyId: 'PROP-001',
      clientId: 'CLIENT-001',
      notarisId: 'NOT-001',
      createdDate: '2025-01-15',
      expiryDate: '2025-12-31',
      digitalSignature: true,
      complianceScore: 98
    },
    {
      id: '2',
      title: 'Building Permit - Office SCBD',
      type: 'permit',
      status: 'pending',
      propertyId: 'PROP-002',
      createdDate: '2025-01-18',
      expiryDate: '2026-01-18',
      digitalSignature: false,
      complianceScore: 85
    },
    {
      id: '3',
      title: 'Land Certificate - Bali Plot',
      type: 'certificate',
      status: 'approved',
      propertyId: 'PROP-003',
      notarisId: 'NOT-002',
      createdDate: '2025-01-10',
      digitalSignature: true,
      complianceScore: 95
    }
  ];

  const notarisProfiles: NotarisProfile[] = [
    {
      id: 'NOT-001',
      name: 'Dr. Sari Wijaya, S.H., M.Kn.',
      license: 'NOT-JKT-2018-001',
      location: 'Jakarta Selatan',
      specialization: ['Property Law', 'Commercial Law', 'Corporate Law'],
      rating: 4.9,
      availability: 'available',
      contact: '+62 811 2345 6789'
    },
    {
      id: 'NOT-002',
      name: 'Ahmad Pratama, S.H., M.H.',
      license: 'NOT-BDG-2019-005',
      location: 'Bandung',
      specialization: ['Real Estate', 'Land Rights', 'Investment Law'],
      rating: 4.8,
      availability: 'busy',
      contact: '+62 812 3456 7890'
    },
    {
      id: 'NOT-003',
      name: 'Lisa Chen, S.H., LL.M.',
      license: 'NOT-BAL-2020-003',
      location: 'Bali',
      specialization: ['Foreign Investment', 'Tourism Law', 'Property Development'],
      rating: 4.7,
      availability: 'available',
      contact: '+62 813 4567 8901'
    }
  ];

  const complianceChecks = [
    { item: 'Property Ownership Verification', status: 'passed', score: 100 },
    { item: 'Zoning Compliance', status: 'passed', score: 95 },
    { item: 'Building Code Adherence', status: 'warning', score: 85 },
    { item: 'Environmental Clearance', status: 'passed', score: 90 },
    { item: 'Tax Compliance', status: 'passed', score: 98 },
    { item: 'Legal Documentation', status: 'warning', score: 88 }
  ];

  const documentTemplates = [
    { name: 'Property Sale Agreement', type: 'contract', language: 'Indonesian' },
    { name: 'Lease Agreement', type: 'agreement', language: 'Indonesian' },
    { name: 'Power of Attorney', type: 'agreement', language: 'Indonesian' },
    { name: 'Property Valuation Report', type: 'certificate', language: 'Indonesian' },
    { name: 'Due Diligence Checklist', type: 'permit', language: 'Indonesian' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'expired': return 'bg-red-100 text-red-700 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'busy': return 'bg-yellow-100 text-yellow-700';
      case 'unavailable': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Compliance Score */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Overall Compliance Score</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Compliance Rating</span>
              <span className="text-2xl font-bold text-green-600">92%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-3">
              <div className="bg-green-600 h-3 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
          <div className="text-center">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <span className="text-sm text-green-700 font-medium">Excellent</span>
          </div>
        </div>
      </div>

      {/* Compliance Checks */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Compliance Checks</h3>
        <div className="space-y-3">
          {complianceChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  check.status === 'passed' ? 'bg-green-500' :
                  check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium text-neutral-900">{check.item}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-600">{check.score}%</span>
                {check.status === 'passed' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setActiveSection('documents')}
          className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
        >
          <FileText className="w-6 h-6 text-blue-600 mb-2" />
          <div className="text-left">
            <div className="font-medium text-blue-700">Manage Documents</div>
            <div className="text-sm text-blue-600">{legalDocuments.length} active documents</div>
          </div>
        </button>
        
        <button 
          onClick={() => setActiveSection('notaris')}
          className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
        >
          <Scale className="w-6 h-6 text-green-600 mb-2" />
          <div className="text-left">
            <div className="font-medium text-green-700">Notaris Network</div>
            <div className="text-sm text-green-600">{notarisProfiles.length} verified notaris</div>
          </div>
        </button>
        
        <button 
          onClick={() => setActiveSection('templates')}
          className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
        >
          <Gavel className="w-6 h-6 text-purple-600 mb-2" />
          <div className="text-left">
            <div className="font-medium text-purple-700">Legal Templates</div>
            <div className="text-sm text-purple-600">{documentTemplates.length} templates available</div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Legal Documents</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Document</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Type</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Compliance</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Signature</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {legalDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-neutral-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-neutral-900">{doc.title}</div>
                      <div className="text-sm text-neutral-500">Created: {doc.createdDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm text-neutral-700">{doc.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            doc.complianceScore >= 90 ? 'bg-green-500' :
                            doc.complianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${doc.complianceScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-neutral-600">{doc.complianceScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {doc.digitalSignature ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Signature className="w-4 h-4" />
                        <span className="text-sm">Signed</span>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-500">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-neutral-600 hover:text-blue-600 transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-neutral-600 hover:text-green-600 transition-colors duration-200">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-neutral-600 hover:text-red-600 transition-colors duration-200">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNotaris = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Notaris Network</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
          <User className="w-4 h-4" />
          <span>Add Notaris</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notarisProfiles.map((notaris) => (
          <div key={notaris.id} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-neutral-900 mb-1">{notaris.name}</h4>
                <p className="text-sm text-neutral-600 mb-2">License: {notaris.license}</p>
                <p className="text-sm text-neutral-600 mb-2">{notaris.location}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(notaris.availability)}`}>
                {notaris.availability}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-1 mb-2">
                <span className="text-sm font-medium text-neutral-700">Rating:</span>
                <span className="text-sm text-amber-600 font-medium">{notaris.rating}/5.0</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {notaris.specialization.map((spec, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600">{notaris.contact}</span>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200">
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Legal Document Templates</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
          <FileText className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTemplates.map((template, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-2">{template.name}</h4>
                <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                  {template.type}
                </span>
              </div>
              <FileText className="w-6 h-6 text-neutral-400" />
            </div>
            
            <p className="text-sm text-neutral-600 mb-4">Language: {template.language}</p>
            
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200">
                Use Template
              </button>
              <button className="px-3 py-2 border border-neutral-300 text-neutral-700 text-sm rounded hover:bg-neutral-50 transition-colors duration-200">
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const sections = [
    { id: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'notaris', label: 'Notaris Network', icon: <Scale className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <Gavel className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Legal Compliance Management</h2>
        <p className="text-sm text-neutral-600">Indonesian real estate legal compliance and documentation</p>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
              activeSection === section.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {section.icon}
            <span className="font-medium">{section.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'documents' && renderDocuments()}
      {activeSection === 'notaris' && renderNotaris()}
      {activeSection === 'templates' && renderTemplates()}
    </div>
  );
};

export default LegalCompliance;