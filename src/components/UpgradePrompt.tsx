import React from 'react';
import { Crown, ArrowRight, X } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  onUpgrade: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  feature, 
  onUpgrade, 
  onDismiss,
  compact = false 
}) => {
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-amber-900">Upgrade Required</h4>
              <p className="text-amber-800 text-sm">
                {feature} is available in Professional plan
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onUpgrade}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>Upgrade</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-2 text-amber-600 hover:bg-amber-200 rounded-lg transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-start space-x-4">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl">
          <Crown className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Unlock Premium Features
          </h3>
          <p className="text-neutral-600 mb-4">
            To access <strong>{feature}</strong>, upgrade to our Professional plan and unlock 
            powerful tools designed to grow your real estate business.
          </p>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-300 flex items-center space-x-2"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-neutral-600 hover:text-neutral-800 font-medium transition-colors duration-200"
              >
                Maybe later
              </button>
            )}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UpgradePrompt;