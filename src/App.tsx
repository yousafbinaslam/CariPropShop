import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './components/admin/AuthGuard';
import { NotificationProvider } from './components/admin/NotificationSystem';
import ErrorBoundary from './components/admin/ErrorBoundary';
import Header from './components/Header';
import Hero from './components/Hero';
import PropertyListings from './components/PropertyListings';
import InteriorDesign from './components/InteriorDesign';
import ArtRoom from './components/ArtRoom';
import Footer from './components/Footer';
import AdminDashboardWrapper from './components/admin/AdminDashboardWrapper';
import Sitemap from './components/Sitemap';
import UpgradeDemo from './components/demo/UpgradeDemo';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <Routes>
                <Route path="/admin/*" element={<AdminDashboardWrapper />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/upgrade-demo" element={<UpgradeDemo />} />
                <Route path="/" element={
                  <div className="min-h-screen bg-white">
                    <Header />
                    <Hero />
                    <PropertyListings />
                    <InteriorDesign />
                    <ArtRoom />
                    <Footer />
                  </div>
                } />
              </Routes>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;