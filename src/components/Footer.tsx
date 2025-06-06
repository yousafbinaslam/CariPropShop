import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Youtube, Linkedin, Shield, FileText, Scale, Users } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      label: 'WhatsApp',
      value: '+62 822 3354 1409',
      link: 'https://wa.me/6282233541409',
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Email',
      value: 'info@caripropshop.com',
      link: 'mailto:info@caripropshop.com',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Address',
      value: 'Surabaya, Indonesia',
      link: null,
    },
  ];

  const socialLinks = [
    { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
    { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
    { icon: <Youtube className="w-5 h-5" />, href: '#', label: 'YouTube' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
  ];

  const quickLinks = [
    { label: t('nav.properties'), href: '#properties' },
    { label: t('nav.interior'), href: '#interior' },
    { label: t('nav.artroom'), href: '#artroom' },
    { label: t('nav.curtains'), href: '#curtains' },
  ];

  const services = [
    'Property Management',
    'Client Relations',
    'Legal Compliance',
    'Payment Processing',
    'Document Management',
    'Analytics & Reporting',
  ];

  const legalLinks = [
    { 
      label: 'Privacy Policy', 
      href: '/privacy-policy',
      icon: <Shield className="w-4 h-4" />,
      description: 'How we protect your personal information'
    },
    { 
      label: 'Terms of Service', 
      href: '/terms-of-service',
      icon: <FileText className="w-4 h-4" />,
      description: 'Terms and conditions for using our platform'
    },
    { 
      label: 'Legal Compliance', 
      href: '/legal-compliance',
      icon: <Scale className="w-4 h-4" />,
      description: 'Indonesian real estate law compliance'
    },
    { 
      label: 'User Agreement', 
      href: '/user-agreement',
      icon: <Users className="w-4 h-4" />,
      description: 'Rights and responsibilities of users'
    },
  ];

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-4">
                Cari PropShop
              </h3>
              <p className="text-neutral-400 mb-6 leading-relaxed">
                Platform manajemen properti terpadu untuk profesional real estate di Indonesia. 
                Kelola properti, klien, dan transaksi dengan efisien dan aman.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="bg-neutral-800 p-3 rounded-lg hover:bg-amber-600 transition-colors duration-300"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-amber-400 transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Our Services</h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <span className="text-neutral-400 hover:text-amber-400 transition-colors duration-300 cursor-pointer">
                      {service}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
              <div className="space-y-4">
                {contactInfo.map((contact, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-amber-400 flex-shrink-0 mt-1">
                      {contact.icon}
                    </div>
                    <div>
                      <div className="text-sm text-neutral-500 mb-1">
                        {contact.label}
                      </div>
                      {contact.link ? (
                        <a
                          href={contact.link}
                          className="text-neutral-300 hover:text-amber-400 transition-colors duration-300"
                        >
                          {contact.value}
                        </a>
                      ) : (
                        <span className="text-neutral-300">{contact.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div className="mt-6">
                <a
                  href="https://wa.me/6282233541409"
                  className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">{t('contact.whatsapp')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Compliance Section */}
        <div className="py-12 border-t border-neutral-800">
          <h4 className="text-lg font-semibold text-white mb-6">Legal & Compliance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {legalLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="group p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-300"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-amber-400 group-hover:text-amber-300 transition-colors duration-300">
                    {link.icon}
                  </div>
                  <h5 className="font-medium text-white group-hover:text-amber-300 transition-colors duration-300">
                    {link.label}
                  </h5>
                </div>
                <p className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
                  {link.description}
                </p>
              </a>
            ))}
          </div>
          
          {/* Legal Disclaimer */}
          <div className="mt-8 p-6 bg-neutral-800 rounded-lg">
            <h5 className="font-semibold text-white mb-3 flex items-center">
              <Scale className="w-5 h-5 text-amber-400 mr-2" />
              Legal Disclaimer
            </h5>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Cari PropShop beroperasi sesuai dengan peraturan perundang-undangan Republik Indonesia. 
              Semua transaksi properti melalui platform ini tunduk pada hukum Indonesia dan diawasi oleh 
              otoritas yang berwenang. Kami berkomitmen untuk menjaga kepatuhan terhadap standar industri 
              dan perlindungan data pribadi sesuai dengan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
            </p>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
              <p className="text-neutral-400 text-sm">
                Get the latest updates on property management and industry insights
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-l-lg focus:outline-none focus:border-amber-500 text-white"
              />
              <button className="px-6 py-3 bg-amber-600 text-white rounded-r-lg hover:bg-amber-700 transition-colors duration-300 font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-neutral-400">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2025 Cari PropShop Indonesia By Invologi (MiYu Inovasi Teknologi). Hak cipta dilindungi.</p>
              <p className="text-xs mt-1">Platform Manajemen Real Estate Berlisensi</p>
            </div>
            <div className="flex space-x-6">
              <a href="/kebijakan-privasi" className="hover:text-amber-400 transition-colors duration-300">
                Kebijakan Privasi
              </a>
              <a href="/syarat-layanan" className="hover:text-amber-400 transition-colors duration-300">
                Syarat Layanan
              </a>
              <a href="/kepatuhan-hukum" className="hover:text-amber-400 transition-colors duration-300">
                Kepatuhan Hukum
              </a>
              <a href="/sitemap" className="hover:text-amber-400 transition-colors duration-300">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;