import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TilesSection from '../components/TilesSection';
import TableSection from '../components/TableSection';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Discover public markets and economic insights from podcasts</h1>
          <p className="text-base sm:text-lg text-gray-600 mb-4">Public market insights and sentiments derived from podcasts from influential investors and experts</p>
          <div className="flex justify-center mb-8">
            <Link
              to="/podcasts" 
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Explore All Podcasts
            </Link>
          </div>
          
          <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200 mb-8" />
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <TilesSection />
            </div>
            <div className="hidden lg:block w-[1px] border-0 border-l border-dashed border-gray-200 -my-6" />
            <div className="w-full lg:w-[320px]">
              <TableSection />
            </div>
          </div>
        </div>
      </main>
      
      <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
      
      <Footer />
    </div>
  );
};

export default LandingPage;