import React from 'react';
import { 
  Home, 
  Building, 
  Users, 
  Calendar, 
  CreditCard, 
  FileText, 
  Shield, 
  HelpCircle,
  Settings,
  BarChart3,
  Database,
  MessageSquare,
  ChevronRight,
  Globe,
  Search
} from 'lucide-react';

const Sitemap: React.FC = () => {
  const siteStructure = [
    {
      category: 'Main Pages',
      icon: <Home className="w-5 h-5" />,
      pages: [
        { name: 'Homepage', url: '/', description: 'Main landing page with property showcase' },
        { name: 'Property Listings', url: '/properties', description: 'Browse all available properties' },
        { name: 'Interior Design', url: '/interior', description: 'Interior design portfolio and services' },
        { name: 'Art Room', url: '/artroom', description: 'Interactive design studio' },
        { name: 'About Us', url: '/about', description: 'Company information and team' },
        { name: 'Contact', url: '/contact', description: 'Contact information and inquiry form' }
      ]
    },
    {
      category: 'Admin Dashboard',
      icon: <Settings className="w-5 h-5" />,
      pages: [
        { name: 'Dashboard Overview', url: '/admin', description: 'Main admin dashboard with statistics' },
        { name: 'Property Management', url: '/admin/properties', description: 'Add and manage property listings' },
        { name: 'Client Management', url: '/admin/clients', description: 'CRM system for client relationships' },
        { name: 'Appointment Scheduler', url: '/admin/appointments', description: 'Schedule and manage appointments' },
        { name: 'Payment Dashboard', url: '/admin/payments', description: 'Payment processing and tracking' },
        { name: 'Analytics', url: '/admin/analytics', description: 'Business analytics and reporting' }
      ]
    },
    {
      category: 'Legal & Compliance',
      icon: <Shield className="w-5 h-5" />,
      pages: [
        { name: 'Legal Compliance', url: '/admin/legal', description: 'Indonesian real estate legal compliance' },
        { name: 'Document Management', url: '/admin/documents', description: 'Legal document storage and management' },
        { name: 'Notaris Network', url: '/admin/notaris', description: 'Verified notaris professionals' },
        { name: 'Privacy Policy', url: '/privacy-policy', description: 'Data protection and privacy policy' },
        { name: 'Terms of Service', url: '/terms-of-service', description: 'Platform terms and conditions' },
        { name: 'User Agreement', url: '/user-agreement', description: 'User rights and responsibilities' }
      ]
    },
    {
      category: 'System Management',
      icon: <Database className="w-5 h-5" />,
      pages: [
        { name: 'Quality Assurance', url: '/admin/quality', description: 'System testing and quality monitoring' },
        { name: 'Database Management', url: '/admin/database', description: 'Database operations and maintenance' },
        { name: 'Backup Management', url: '/admin/backups', description: 'Data backup and recovery' },
        { name: 'System Settings', url: '/admin/settings', description: 'Platform configuration and settings' }
      ]
    },
    {
      category: 'Support & Help',
      icon: <HelpCircle className="w-5 h-5" />,
      pages: [
        { name: 'Help Documentation', url: '/admin/help', description: 'Comprehensive user guides and tutorials' },
        { name: 'Video Tutorials', url: '/help/videos', description: 'Step-by-step video guides' },
        { name: 'FAQ', url: '/help/faq', description: 'Frequently asked questions' },
        { name: 'AI Assistant', url: '/help/ai', description: 'Jenny AI assistant for instant help' },
        { name: 'Support Center', url: '/support', description: '24/7 customer support' }
      ]
    },
    {
      category: 'Communication',
      icon: <MessageSquare className="w-5 h-5" />,
      pages: [
        { name: 'WhatsApp Business', url: 'https://wa.me/6282233541409', description: 'Direct WhatsApp communication' },
        { name: 'Communication Hub', url: '/admin/communication', description: 'Centralized communication management' },
        { name: 'Client Portal', url: '/client-portal', description: 'Client access portal' },
        { name: 'Appointment Booking', url: '/book-appointment', description: 'Online appointment booking' }
      ]
    }
  ];

  const quickLinks = [
    { name: 'Add New Property', url: '/admin/properties/new', icon: <Building className="w-4 h-4" /> },
    { name: 'Client Dashboard', url: '/admin/clients', icon: <Users className="w-4 h-4" /> },
    { name: 'Schedule Appointment', url: '/admin/appointments/new', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Payment Processing', url: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Legal Documents', url: '/admin/legal', icon: <FileText className="w-4 h-4" /> },
    { name: 'System Analytics', url: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">Complete Site Navigation</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Cari PropShop Sitemap
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Comprehensive navigation guide for all platform features and pages
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search pages..."
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-neutral-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="text-blue-600">
                  {link.icon}
                </div>
                <span className="font-medium text-neutral-900">{link.name}</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 ml-auto" />
              </a>
            ))}
          </div>
        </div>

        {/* Site Structure */}
        <div className="space-y-8">
          {siteStructure.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900">{section.category}</h3>
                  <span className="text-sm text-neutral-500">({section.pages.length} pages)</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.pages.map((page, pageIndex) => (
                    <a
                      key={pageIndex}
                      href={page.url}
                      className="group p-4 border border-neutral-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-neutral-900 group-hover:text-blue-700 transition-colors duration-200">
                            {page.name}
                          </h4>
                          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                            {page.description}
                          </p>
                          <div className="mt-2">
                            <code className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded">
                              {page.url}
                            </code>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors duration-200 ml-2 flex-shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Need Help Navigating?</h3>
            <p className="text-neutral-600 mb-6">
              Our AI assistant Jenny is available 24/7 to help you find what you're looking for.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="https://wa.me/6282233541409"
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contact Support</span>
              </a>
              <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <HelpCircle className="w-4 h-4" />
                <span>Ask Jenny AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;