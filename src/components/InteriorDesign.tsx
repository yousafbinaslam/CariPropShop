import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, Palette, Home, Sparkles, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface DesignStyle {
  id: number;
  name: string;
  description: string;
  image: string;
  projectCount: number;
  featured: boolean;
}

const InteriorDesign: React.FC = () => {
  const { t } = useLanguage();
  const [activeStyle, setActiveStyle] = useState(0);

  const designStyles: DesignStyle[] = [
    {
      id: 1,
      name: t('interior.styles.modern'),
      description: 'Clean lines, minimalist approach with contemporary elements',
      image: 'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800',
      projectCount: 245,
      featured: true,
    },
    {
      id: 2,
      name: t('interior.styles.contemporary'),
      description: 'Current trends blended with timeless elegance',
      image: 'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800',
      projectCount: 189,
      featured: true,
    },
    {
      id: 3,
      name: t('interior.styles.traditional'),
      description: 'Classic Indonesian heritage with modern comfort',
      image: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800',
      projectCount: 167,
      featured: false,
    },
    {
      id: 4,
      name: t('interior.styles.minimalist'),
      description: 'Less is more philosophy with functional beauty',
      image: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800',
      projectCount: 203,
      featured: true,
    },
  ];

  const featuredProjects = [
    {
      id: 1,
      title: 'Luxury Living Room - Kemang',
      category: 'Living Room',
      image: 'https://images.pexels.com/photos/1571452/pexels-photo-1571452.jpeg?auto=compress&cs=tinysrgb&w=600',
      designer: 'Sarah Chen',
    },
    {
      id: 2,
      title: 'Modern Kitchen Design - BSD',
      category: 'Kitchen',
      image: 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=600',
      designer: 'Ahmad Pratama',
    },
    {
      id: 3,
      title: 'Master Bedroom Suite - PIK',
      category: 'Bedroom',
      image: 'https://images.pexels.com/photos/1571454/pexels-photo-1571454.jpeg?auto=compress&cs=tinysrgb&w=600',
      designer: 'Lisa Wijaya',
    },
    {
      id: 4,
      title: 'Executive Office - Sudirman',
      category: 'Office',
      image: 'https://images.pexels.com/photos/1571448/pexels-photo-1571448.jpeg?auto=compress&cs=tinysrgb&w=600',
      designer: 'David Tan',
    },
  ];

  const nextStyle = () => {
    setActiveStyle((prev) => (prev + 1) % designStyles.length);
  };

  const prevStyle = () => {
    setActiveStyle((prev) => (prev - 1 + designStyles.length) % designStyles.length);
  };

  return (
    <section id="interior" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-50 rounded-full mb-6">
            <Palette className="w-4 h-4 text-amber-600" />
            <span className="text-amber-700 text-sm font-medium">600+ Proyek Desain</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            {t('interior.title')}
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            {t('interior.subtitle')}
          </p>
        </div>

        {/* Design Styles Carousel */}
        <div className="mb-20">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeStyle * 100}%)` }}
              >
                {designStyles.map((style, index) => (
                  <div key={style.id} className="w-full flex-shrink-0">
                    <div className="relative h-96 md:h-[500px]">
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                        <div className="max-w-2xl">
                          {style.featured && (
                            <span className="inline-block bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                              Gaya Unggulan
                            </span>
                          )}
                          <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            {style.name}
                          </h3>
                          <p className="text-white/90 text-lg mb-4">
                            {style.description}
                          </p>
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2 text-white/80">
                              <Home className="w-4 h-4" />
                              <span className="text-sm">{style.projectCount} Proyek</span>
                            </div>
                            <button className="flex items-center space-x-2 bg-white text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 hover:text-white transition-all duration-300">
                              <span>{t('interior.view.portfolio')}</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevStyle}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-neutral-700" />
            </button>
            <button
              onClick={nextStyle}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-neutral-700" />
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {designStyles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStyle(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeStyle ? 'bg-amber-600' : 'bg-neutral-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Featured Projects Grid */}
        <div>
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-bold text-neutral-900">Proyek Unggulan</h3>
            <button className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-semibold transition-colors duration-300">
              <span>Lihat Semua Proyek</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="bg-white text-neutral-900 p-3 rounded-full hover:bg-amber-600 hover:text-white transition-colors duration-300">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                      {project.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-semibold text-neutral-900 mb-2 line-clamp-2">
                    {project.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    <Sparkles className="w-3 h-3" />
                    <span>by {project.designer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteriorDesign;