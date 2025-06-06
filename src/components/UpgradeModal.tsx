import React from 'react';
import { Crown, X, Check, ArrowRight, Shield, Zap, Users, BarChart3 } from 'lucide-react';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonStyle: string;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ 
  isOpen, 
  onClose, 
  currentPlan = 'Basic' 
}) => {
  if (!isOpen) return null;

  const plans: Plan[] = [
    {
      name: 'Basic',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Up to 5 property listings',
        'Basic client management',
        'Standard support',
        'Mobile app access'
      ],
      buttonText: 'Current Plan',
      buttonStyle: 'bg-neutral-200 text-neutral-600 cursor-not-allowed'
    },
    {
      name: 'Professional',
      price: 'IDR 299,000',
      period: 'per month',
      description: 'For growing real estate businesses',
      features: [
        'Unlimited property listings',
        'Advanced CRM & analytics',
        'Legal compliance tools',
        'AI-powered recommendations',
        'Priority support',
        'Team collaboration',
        'Custom branding',
        'API access'
      ],
      popular: true,
      buttonText: 'Upgrade Now',
      buttonStyle: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800'
    },
    {
      name: 'Enterprise',
      price: 'IDR 799,000',
      period: 'per month',
      description: 'For large teams and agencies',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'Advanced security features',
        'Custom integrations',
        'Dedicated account manager',
        'White-label solution',
        'SLA guarantee',
        'Custom training'
      ],
      buttonText: 'Contact Sales',
      buttonStyle: 'bg-neutral-900 text-white hover:bg-neutral-800'
    }
  ];

  const handleUpgrade = (planName: string) => {
    if (planName === 'Professional') {
      // Redirect to payment page or handle upgrade logic
      window.location.href = '/upgrade/professional';
    } else if (planName === 'Enterprise') {
      // Redirect to contact sales
      window.location.href = '/contact-sales';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-900/20 p-8 rounded-t-2xl text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full mb-6">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Choose Your Plan</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">
              Unlock Your Real Estate Potential
            </h2>
            <p className="text-neutral-300 max-w-2xl mx-auto">
              Choose the perfect plan for your business needs. Upgrade anytime, cancel anytime. 
              All plans include our core features with varying limits and advanced capabilities.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border-2 p-8 ${
                  plan.popular 
                    ? 'border-amber-500 bg-gradient-to-b from-amber-50 to-white' 
                    : 'border-neutral-200 bg-white'
                } ${plan.name === currentPlan ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                {plan.name === currentPlan && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Current
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                  <p className="text-neutral-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-neutral-900">
                      {plan.price}
                    </div>
                    <div className="text-neutral-600">{plan.period}</div>
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={plan.name === currentPlan}
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-neutral-900 mb-4">Features included:</h4>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Benefits */}
          <div className="mt-12 bg-neutral-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-neutral-900 text-center mb-8">
              Why Choose Cari PropShop Professional?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">Legal Compliance</h4>
                <p className="text-neutral-600 text-sm">
                  Full Indonesian real estate law compliance with automated document generation
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">AI-Powered</h4>
                <p className="text-neutral-600 text-sm">
                  Smart property recommendations and market insights powered by AI
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">Team Collaboration</h4>
                <p className="text-neutral-600 text-sm">
                  Work seamlessly with your team with role-based access and permissions
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-semibold text-neutral-900 mb-2">Advanced Analytics</h4>
                <p className="text-neutral-600 text-sm">
                  Detailed insights and reports to grow your real estate business
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 pt-8 border-t border-neutral-200">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12 text-sm text-neutral-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>24/7 customer support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Instant activation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;