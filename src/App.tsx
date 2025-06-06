import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Hero from './components/Hero';
import PropertyListings from './components/PropertyListings';
import InteriorDesign from './components/InteriorDesign';
import ArtRoom from './components/ArtRoom';
import Footer from './components/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import Sitemap from './components/Sitemap';
import UpgradeDemo from './components/demo/UpgradeDemo';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
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
      </LanguageProvider>
    </Router>
  );
}

export default App;