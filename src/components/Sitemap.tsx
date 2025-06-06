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
      category: 'Halaman Utama',
      icon: <Home className="w-5 h-5" />,
      pages: [
        { name: 'Beranda', url: '/', description: 'Halaman utama dengan showcase properti' },
        { name: 'Daftar Properti', url: '/properties', description: 'Jelajahi semua properti yang tersedia' },
        { name: 'Desain Interior', url: '/interior', description: 'Portofolio dan layanan desain interior' },
        { name: 'Ruang Seni', url: '/artroom', description: 'Studio desain interaktif' },
        { name: 'Tentang Kami', url: '/about', description: 'Informasi perusahaan dan tim' },
        { name: 'Kontak', url: '/contact', description: 'Informasi kontak dan formulir pertanyaan' }
      ]
    },
    {
      category: 'Dashboard Admin',
      icon: <Settings className="w-5 h-5" />,
      pages: [
        { name: 'Ringkasan Dashboard', url: '/admin', description: 'Dashboard admin utama dengan statistik' },
        { name: 'Manajemen Properti', url: '/admin/properties', description: 'Tambah dan kelola daftar properti' },
        { name: 'Manajemen Klien', url: '/admin/clients', description: 'Sistem CRM untuk hubungan klien' },
        { name: 'Penjadwal Janji Temu', url: '/admin/appointments', description: 'Jadwalkan dan kelola janji temu' },
        { name: 'Dashboard Pembayaran', url: '/admin/payments', description: 'Pemrosesan dan pelacakan pembayaran' },
        { name: 'Analitik', url: '/admin/analytics', description: 'Analitik bisnis dan pelaporan' }
      ]
    },
    {
      category: 'Hukum & Kepatuhan',
      icon: <Shield className="w-5 h-5" />,
      pages: [
        { name: 'Kepatuhan Hukum', url: '/admin/legal', description: 'Kepatuhan hukum real estate Indonesia' },
        { name: 'Manajemen Dokumen', url: '/admin/documents', description: 'Penyimpanan dan manajemen dokumen hukum' },
        { name: 'Jaringan Notaris', url: '/admin/notaris', description: 'Profesional notaris terverifikasi' },
        { name: 'Kebijakan Privasi', url: '/privacy-policy', description: 'Perlindungan data dan kebijakan privasi' },
        { name: 'Syarat Layanan', url: '/terms-of-service', description: 'Syarat dan ketentuan platform' },
        { name: 'Perjanjian Pengguna', url: '/user-agreement', description: 'Hak dan tanggung jawab pengguna' }
      ]
    },
    {
      category: 'Manajemen Sistem',
      icon: <Database className="w-5 h-5" />,
      pages: [
        { name: 'Jaminan Kualitas', url: '/admin/quality', description: 'Pengujian sistem dan pemantauan kualitas' },
        { name: 'Manajemen Database', url: '/admin/database', description: 'Operasi dan pemeliharaan database' },
        { name: 'Manajemen Backup', url: '/admin/backups', description: 'Backup dan pemulihan data' },
        { name: 'Pengaturan Sistem', url: '/admin/settings', description: 'Konfigurasi dan pengaturan platform' }
      ]
    },
    {
      category: 'Dukungan & Bantuan',
      icon: <HelpCircle className="w-5 h-5" />,
      pages: [
        { name: 'Dokumentasi Bantuan', url: '/admin/help', description: 'Panduan pengguna dan tutorial komprehensif' },
        { name: 'Tutorial Video', url: '/help/videos', description: 'Panduan video langkah demi langkah' },
        { name: 'FAQ', url: '/help/faq', description: 'Pertanyaan yang sering diajukan' },
        { name: 'Asisten AI', url: '/help/ai', description: 'Asisten AI Jenny untuk bantuan instan' },
        { name: 'Pusat Dukungan', url: '/support', description: 'Dukungan pelanggan 24/7' }
      ]
    },
    {
      category: 'Komunikasi',
      icon: <MessageSquare className="w-5 h-5" />,
      pages: [
        { name: 'WhatsApp Bisnis', url: 'https://wa.me/6282233541409', description: 'Komunikasi WhatsApp langsung' },
        { name: 'Pusat Komunikasi', url: '/admin/communication', description: 'Manajemen komunikasi terpusat' },
        { name: 'Portal Klien', url: '/client-portal', description: 'Portal akses klien' },
        { name: 'Pemesanan Janji Temu', url: '/book-appointment', description: 'Pemesanan janji temu online' }
      ]
    }
  ];

  const quickLinks = [
    { name: 'Tambah Properti Baru', url: '/admin/properties/new', icon: <Building className="w-4 h-4" /> },
    { name: 'Dashboard Klien', url: '/admin/clients', icon: <Users className="w-4 h-4" /> },
    { name: 'Jadwalkan Janji Temu', url: '/admin/appointments/new', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Pemrosesan Pembayaran', url: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Dokumen Hukum', url: '/admin/legal', icon: <FileText className="w-4 h-4" /> },
    { name: 'Analitik Sistem', url: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full mb-6">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">Navigasi Situs Lengkap</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Cari PropShop Sitemap
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Panduan navigasi komprehensif untuk semua fitur dan halaman platform
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari halaman..."
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Akses Cepat</h2>
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
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Butuh Bantuan Navigasi?</h3>
            <p className="text-neutral-600 mb-6">
              Asisten AI kami Jenny tersedia 24/7 untuk membantu Anda menemukan apa yang Anda cari.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="https://wa.me/6282233541409"
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hubungi Dukungan</span>
              </a>
              <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <HelpCircle className="w-4 h-4" />
                <span>Tanya Jenny AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;