import React from 'react';
import { Crown, ArrowRight, Check, Star, Shield, Zap } from 'lucide-react';

interface UpgradeRequiredProps {
  currentPlan?: string;
  feature?: string;
  onUpgrade?: () => void;
  onClose?: () => void;
}

const UpgradeRequired: React.FC<UpgradeRequiredProps> = ({ 
  currentPlan = 'Basic', 
  feature = 'this feature',
  onUpgrade,
  onClose 
}) => {
  const premiumFeatures = [
    { icon: <Crown className="w-4 h-4" />, text: 'Unlimited property listings' },
    { icon: <Shield className="w-4 h-4" />, text: 'Advanced legal compliance tools' },
    { icon: <Zap className="w-4 h-4" />, text: 'AI-powered property recommendations' },
    { icon: <Star className="w-4 h-4" />, text: 'Priority customer support' },
    { icon: <Check className="w-4 h-4" />, text: 'Advanced analytics dashboard' },
    { icon: <Check className="w-4 h-4" />, text: 'Multi-user team collaboration' }
  ];

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default upgrade action - redirect to upgrade page
      window.location.href = '/upgrade';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-600 to-amber-700 p-8 rounded-t-2xl text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">
            Upgrade Required
          </h2>
          <p className="text-amber-100 text-center">
            Unlock the full potential of your real estate business
          </p>

          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Current Status */}
          <div className="bg-neutral-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-neutral-900">Current Plan</h3>
                <p className="text-neutral-600">{currentPlan} Subscription</p>
              </div>
              <div className="bg-neutral-200 text-neutral-700 px-3 py-1 rounded-full text-sm font-medium">
                Limited Access
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">
                    Premium Feature Access Required
                  </h4>
                  <p className="text-amber-800 text-sm">
                    To access {feature}, please upgrade to our Professional plan. 
                    You'll unlock powerful tools designed to grow your real estate business.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              What you'll get with Professional:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <span className="text-green-800 text-sm font-medium">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-amber-500 fill-current" />
                <span className="text-sm font-medium text-neutral-700">Limited Time Offer</span>
                <Star className="w-5 h-5 text-amber-500 fill-current" />
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">
                IDR 299,000
                <span className="text-lg font-normal text-neutral-600">/month</span>
              </div>
              <p className="text-neutral-600 text-sm">
                Save 20% with annual billing • 30-day money-back guarantee
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUpgradeClick}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>Upgrade to Professional</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="px-6 py-4 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 transition-colors duration-200"
              >
                Maybe Later
              </button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-center space-x-8 text-sm text-neutral-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeRequired;