import React, { useState } from 'react';
import UpgradeRequired from '../UpgradeRequired';
import UpgradeModal from '../UpgradeModal';
import UpgradePrompt from '../UpgradePrompt';
import { Crown, Settings, BarChart3, Users } from 'lucide-react';

const UpgradeDemo: React.FC = () => {
  const [showUpgradeRequired, setShowUpgradeRequired] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCompactPrompt, setShowCompactPrompt] = useState(true);
  const [showFullPrompt, setShowFullPrompt] = useState(true);

  const handleUpgrade = () => {
    alert('Redirecting to upgrade page...');
    // In real implementation, redirect to payment page
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Upgrade Message Components Demo
          </h1>
          <p className="text-neutral-600">
            Professional subscription upgrade messages for Cari PropShop
          </p>
        </div>

        <div className="space-y-8">
          {/* Demo Buttons */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Demo Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowUpgradeRequired(true)}
                className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors duration-200"
              >
                <Crown className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-700">Show Full Upgrade Modal</span>
              </button>
              
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-700">Show Plan Selection Modal</span>
              </button>
            </div>
          </div>

          {/* Compact Prompt Demo */}
          {showCompactPrompt && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Compact Upgrade Prompt</h3>
              <UpgradePrompt
                feature="Advanced Analytics Dashboard"
                onUpgrade={handleUpgrade}
                onDismiss={() => setShowCompactPrompt(false)}
                compact={true}
              />
            </div>
          )}

          {/* Full Prompt Demo */}
          {showFullPrompt && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Full Upgrade Prompt</h3>
              <UpgradePrompt
                feature="AI-Powered Property Recommendations"
                onUpgrade={handleUpgrade}
                onDismiss={() => setShowFullPrompt(false)}
                compact={false}
              />
            </div>
          )}

          {/* Feature Cards with Upgrade Prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-neutral-900">Advanced Analytics</h3>
              </div>
              <p className="text-neutral-600 mb-4">
                Get detailed insights into your property performance, market trends, and client behavior.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-800 text-sm font-medium">Professional Feature</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-neutral-900">Team Collaboration</h3>
              </div>
              <p className="text-neutral-600 mb-4">
                Invite team members, assign roles, and collaborate on property management tasks.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-800 text-sm font-medium">Professional Feature</span>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Usage Examples</h3>
            <div className="space-y-4 text-sm">
              <div className="bg-neutral-50 rounded-lg p-4">
                <h4 className="font-medium text-neutral-900 mb-2">1. Feature Access Restriction</h4>
                <p className="text-neutral-600">
                  Show the full upgrade modal when users try to access premium features like advanced analytics or AI recommendations.
                </p>
              </div>
              
              <div className="bg-neutral-50 rounded-lg p-4">
                <h4 className="font-medium text-neutral-900 mb-2">2. Plan Selection</h4>
                <p className="text-neutral-600">
                  Use the plan selection modal for users who want to compare all available plans and their features.
                </p>
              </div>
              
              <div className="bg-neutral-50 rounded-lg p-4">
                <h4 className="font-medium text-neutral-900 mb-2">3. Inline Prompts</h4>
                <p className="text-neutral-600">
                  Use compact or full prompts within the interface to highlight premium features without interrupting the user flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showUpgradeRequired && (
        <UpgradeRequired
          currentPlan="Basic"
          feature="Advanced Analytics Dashboard"
          onUpgrade={handleUpgrade}
          onClose={() => setShowUpgradeRequired(false)}
        />
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan="Basic"
      />
    </div>
  );
};

export default UpgradeDemo;