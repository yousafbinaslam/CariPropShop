import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Menu, X, Globe, MessageCircle, Phone, Calendar } from 'lucide-react';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const navItems = [
    { key: 'nav.home', href: '#home' },
    { key: 'nav.properties', href: '#properties' },
    { key: 'nav.interior', href: '#interior' },
    { key: 'nav.artroom', href: '#artroom' },
    { key: 'nav.curtains', href: '#curtains' },
    { key: 'nav.about', href: '#about' },
    { key: 'nav.contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Cari PropShop
            </h1>
            <p className="text-xs text-neutral-600 font-medium">Manajemen Properti</p>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="text-neutral-700 hover:text-amber-700 font-medium transition-colors duration-200"
              >
                {t(item.key)}
              </a>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-neutral-200 hover:border-amber-300 hover:bg-amber-50 transition-all duration-200"
            >
              <Globe className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-700">
                {language === 'id' ? 'ID' : 'EN'}
              </span>
            </button>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors duration-200">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors duration-200">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors duration-200">
                <Calendar className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-neutral-700" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-200">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  className="px-4 py-3 rounded-lg text-neutral-700 hover:bg-amber-50 hover:text-amber-700 font-medium transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.key)}
                </a>
              ))}
              <div className="flex items-center justify-center space-x-4 pt-4 border-t border-neutral-200 mt-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('contact.whatsapp')}</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;