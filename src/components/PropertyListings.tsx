import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MapPin, Bed, Bath, Square, Eye, MessageSquare, Heart, Filter } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  type: 'residential' | 'commercial' | 'industrial' | 'land';
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  image: string;
  featured: boolean;
  virtual360: boolean;
}

const PropertyListings: React.FC = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const properties: Property[] = [
    {
      id: 1,
      title: 'Modern Villa Kemang',
      type: 'residential',
      price: 8500000000,
      location: 'Kemang, Jakarta Selatan',
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: true,
      virtual360: true,
    },
    {
      id: 2,
      title: 'Luxury Apartment Senayan',
      type: 'residential',
      price: 12000000000,
      location: 'Senayan, Jakarta Pusat',
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: true,
      virtual360: true,
    },
    {
      id: 3,
      title: 'Prime Office Space SCBD',
      type: 'commercial',
      price: 25000000000,
      location: 'SCBD, Jakarta Selatan',
      area: 500,
      image: 'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: false,
      virtual360: true,
    },
    {
      id: 4,
      title: 'Industrial Warehouse Cikampek',
      type: 'industrial',
      price: 15000000000,
      location: 'Cikampek, Jawa Barat',
      area: 2000,
      image: 'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: false,
      virtual360: false,
    },
    {
      id: 5,
      title: 'Premium Land Plot Bali',
      type: 'land',
      price: 5000000000,
      location: 'Canggu, Bali',
      area: 1000,
      image: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: true,
      virtual360: false,
    },
    {
      id: 6,
      title: 'Contemporary House Bandung',
      type: 'residential',
      price: 4500000000,
      location: 'Dago, Bandung',
      bedrooms: 5,
      bathrooms: 4,
      area: 420,
      image: 'https://images.pexels.com/photos/1396121/pexels-photo-1396121.jpeg?auto=compress&cs=tinysrgb&w=800',
      featured: false,
      virtual360: true,
    },
  ];

  const filters = [
    { key: 'all', label: t('properties.filter.all') },
    { key: 'residential', label: t('properties.filter.residential') },
    { key: 'commercial', label: t('properties.filter.commercial') },
    { key: 'industrial', label: t('properties.filter.industrial') },
    { key: 'land', label: t('properties.filter.land') },
  ];

  const filteredProperties = activeFilter === 'all' 
    ? properties 
    : properties.filter(property => property.type === activeFilter);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const toggleFavorite = (propertyId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(propertyId)) {
      newFavorites.delete(propertyId);
    } else {
      newFavorites.add(propertyId);
    }
    setFavorites(newFavorites);
  };

  return (
    <section id="properties" className="py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t('properties.title')}
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            {t('properties.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                activeFilter === filter.key
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-white text-neutral-700 hover:bg-amber-50 hover:text-amber-700 border border-neutral-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {property.featured && (
                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  )}
                  {property.virtual360 && (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>360°</span>
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(property.id)}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-300 ${
                    favorites.has(property.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/80 text-neutral-600 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorites.has(property.id) ? 'fill-current' : ''}`} />
                </button>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-3">
                    {property.virtual360 && (
                      <button className="bg-white text-neutral-900 px-4 py-2 rounded-lg font-medium hover:bg-amber-600 hover:text-white transition-colors duration-300">
                        {t('properties.virtual.tour')}
                      </button>
                    )}
                    <button className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors duration-300">
                      {t('properties.inquiry')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Price */}
                <div className="text-2xl font-bold text-amber-600 mb-2">
                  {formatPrice(property.price)}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-neutral-900 mb-2 line-clamp-2">
                  {property.title}
                </h3>

                {/* Location */}
                <div className="flex items-center space-x-2 text-neutral-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{property.location}</span>
                </div>

                {/* Property Details */}
                <div className="flex items-center justify-between text-sm text-neutral-600 border-t border-neutral-100 pt-4">
                  <div className="flex items-center space-x-4">
                    {property.bedrooms && (
                      <div className="flex items-center space-x-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center space-x-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Square className="w-4 h-4" />
                      <span>{property.area} {t('common.sqm')}</span>
                    </div>
                  </div>
                  
                  <button className="p-2 text-neutral-400 hover:text-amber-600 transition-colors duration-300">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Load More Properties
          </button>
        </div>
      </div>
    </section>
  );
};

export default PropertyListings;