import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HowItWorks from '../components/HowItWorks';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">About PodSieve</h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            PodSieve extracts valuable market insights from podcasts to help you make informed decisions.
            Visit <a href="https://podsieve.com" className="text-gray-900 font-medium hover:underline">podsieve.com</a> for the latest financial intelligence.
          </p>
          
          <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200 mb-8" />
          
          <HowItWorks />
        </div>
      </main>
      
      <div className="w-full h-[1px] border-0 border-b border-dashed border-gray-200" />
      
      <Footer />
    </div>
  );
}

export default AboutPage;