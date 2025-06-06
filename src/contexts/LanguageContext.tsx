import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.properties': 'Properti',
    'nav.interior': 'Interior Design',
    'nav.artroom': 'Art Room',
    'nav.curtains': 'Desain Gorden',
    'nav.about': 'Tentang Kami',
    'nav.contact': 'Kontak',
    
    // Hero Section
    'hero.subtitle': 'Platform Manajemen Properti Terpadu Indonesia',
    'hero.description': 'Kelola properti, klien, dan transaksi dengan sistem ERP/CRM terlengkap untuk profesional real estate di Indonesia.',
    'hero.cta.explore': 'Jelajahi Properti',
    'hero.cta.design': 'Akses Admin',
    
    // Property Section
    'properties.title': 'Properti Eksklusif',
    'properties.subtitle': 'Koleksi properti premium pilihan dengan standar kemewahan tertinggi',
    'properties.filter.all': 'Semua',
    'properties.filter.residential': 'Residensial',
    'properties.filter.commercial': 'Komersial',
    'properties.filter.industrial': 'Industri',
    'properties.filter.land': 'Tanah',
    'properties.virtual.tour': 'Tur Virtual 360°',
    'properties.inquiry': 'Tanya Sekarang',
    
    // Interior Design
    'interior.title': 'Portofolio Desain Interior',
    'interior.subtitle': 'Inspirasi desain dari para ahli untuk menciptakan ruang impian Anda',
    'interior.styles.modern': 'Modern',
    'interior.styles.contemporary': 'Kontemporer',
    'interior.styles.traditional': 'Tradisional',
    'interior.styles.minimalist': 'Minimalis',
    'interior.view.portfolio': 'Lihat Portofolio',
    
    // Art Room
    'artroom.title': 'Ruang Seni - Studio Desain Interaktif',
    'artroom.subtitle': 'Rencanakan dan visualisasikan desain interior Anda dengan teknologi canggih',
    'artroom.features.planner': 'Perencana Ruang Virtual',
    'artroom.features.configurator': 'Konfigurator Furnitur',
    'artroom.features.materials': 'Perpustakaan Material',
    'artroom.features.visualization': 'Visualisasi Real-time',
    'artroom.start': 'Mulai Desain (Min. IDR 700.000)',
    
    // Contact
    'contact.whatsapp': 'Chat WhatsApp',
    'contact.consultation': 'Konsultasi Video',
    'contact.appointment': 'Buat Janji',
    
    // Common
    'common.currency': 'IDR',
    'common.sqm': 'm²',
    'common.bedrooms': 'Kamar Tidur',
    'common.bathrooms': 'Kamar Mandi',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.properties': 'Properties',
    'nav.interior': 'Interior Design',
    'nav.artroom': 'Art Room',
    'nav.curtains': 'Curtain Design',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'EstateElegance Indonesia',
    'hero.subtitle': 'Exclusive Platform for Luxury Real Estate & Interior Design',
    'hero.description': 'Discover your dream property and create elegant living spaces with Indonesia\'s leading interior design services.',
    'hero.cta.explore': 'Explore Properties',
    'hero.cta.design': 'Start Designing',
    
    // Property Section
    'properties.title': 'Exclusive Properties',
    'properties.subtitle': 'Premium property collection with the highest luxury standards',
    'properties.filter.all': 'All',
    'properties.filter.residential': 'Residential',
    'properties.filter.commercial': 'Commercial',
    'properties.filter.industrial': 'Industrial',
    'properties.filter.land': 'Land',
    'properties.virtual.tour': '360° Virtual Tour',
    'properties.inquiry': 'Inquire Now',
    
    // Interior Design
    'interior.title': 'Interior Design Portfolio',
    'interior.subtitle': 'Design inspiration from experts to create your dream spaces',
    'interior.styles.modern': 'Modern',
    'interior.styles.contemporary': 'Contemporary',
    'interior.styles.traditional': 'Traditional',
    'interior.styles.minimalist': 'Minimalist',
    'interior.view.portfolio': 'View Portfolio',
    
    // Art Room
    'artroom.title': 'Art Room - Interactive Design Studio',
    'artroom.subtitle': 'Plan and visualize your interior design with advanced technology',
    'artroom.features.planner': 'Virtual Room Planner',
    'artroom.features.configurator': 'Furniture Configurator',
    'artroom.features.materials': 'Material Library',
    'artroom.features.visualization': 'Real-time Visualization',
    'artroom.start': 'Start Designing (Min. IDR 700,000)',
    
    // Contact
    'contact.whatsapp': 'WhatsApp Chat',
    'contact.consultation': 'Video Consultation',
    'contact.appointment': 'Book Appointment',
    
    // Common
    'common.currency': 'IDR',
    'common.sqm': 'sqm',
    'common.bedrooms': 'Bedrooms',
    'common.bathrooms': 'Bathrooms',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('id');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['id']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};