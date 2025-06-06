import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Palette, Layers, Eye, Sparkles, Play, Lock, Shield } from 'lucide-react';

const ArtRoom: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: t('artroom.features.planner'),
      description: 'Plan your space with our advanced 3D room planner and see instant results',
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: t('artroom.features.configurator'),
      description: 'Customize furniture pieces to match your exact specifications and style',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: t('artroom.features.materials'),
      description: 'Explore our extensive library of premium materials and finishes',
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: t('artroom.features.visualization'),
      description: 'See your design come to life with photorealistic real-time rendering',
    },
  ];

  return (
    <section id="artroom" className="py-20 bg-gradient-to-br from-neutral-900 via-neutral-800 to-amber-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full mb-6">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">Premium Design Studio</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('artroom.title')}
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            {t('artroom.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-amber-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Security Notice */}
            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Lock className="w-5 h-5 text-amber-400" />
                <h4 className="text-white font-semibold">Protected Content</h4>
              </div>
              <p className="text-amber-100 text-sm">
                All designs are protected with advanced screenshot prevention and watermarking technology. 
                Your creative work remains secure and exclusive.
              </p>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="relative">
            {/* Main Preview Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Art Room Preview"
                className="w-full h-96 object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="group bg-white/20 backdrop-blur-sm p-6 rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300">
                  <Play className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </button>
              </div>

              {/* Bottom Info */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold text-lg">Interactive Demo</h4>
                    <p className="text-white/80 text-sm">Experience the Art Room</p>
                  </div>
                  <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    3D Preview
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-amber-500 text-white p-4 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-xs">Support</div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">1000+</div>
                <div className="text-xs text-neutral-600">Materials</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-amber-600/20 to-amber-700/20 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Create Your Dream Space?
            </h3>
            <p className="text-neutral-300 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied clients who have transformed their spaces with our premium design studio. 
              Professional consultation included with every project.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <span>{t('artroom.start')}</span>
              </button>
              
              <button className="text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-300">
                Schedule Free Consultation
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-neutral-400 text-sm">Completed Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">98%</div>
                <div className="text-neutral-400 text-sm">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">15+</div>
                <div className="text-neutral-400 text-sm">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtRoom;