import React from 'react';
import { Podcast, Youtube, Brain, CloudCog, MonitorSmartphone } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <div className="flex gap-2">
        <Podcast className="w-8 h-8 text-purple-500" />
        <Youtube className="w-8 h-8 text-red-500" />
      </div>,
      title: "Content Collection",
      description: "Podcasts and YouTube video transcripts are collected from various sources"
    },
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: "AI Processing",
      description: "Python-based LLMs analyze transcripts to extract valuable market insights"
    },
    {
      icon: <CloudCog className="w-8 h-8 text-gray-600" />,
      title: "Quality Assurance",
      description: "Data undergoes rigorous quality and integrity checks before storage"
    },
    {
      icon: <MonitorSmartphone className="w-8 h-8 text-green-500" />,
      title: "Web Delivery",
      description: "Processed insights are served to users through our web platform"
    }
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our advanced system processes podcast and video content to bring you valuable market insights
        </p>
      </div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 transform -translate-y-1/2 hidden lg:block" />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative bg-white rounded-2xl p-6 flex flex-col items-center text-center
                transition-all duration-300 hover:translate-y-[-4px]
                border border-gray-100 hover:border-gray-200
                shadow-[0_2px_4px_rgba(0,0,0,0.02)]
                hover:shadow-[0_4px_8px_rgba(0,0,0,0.05)]"
            >
              {/* Step Number */}
              <div className="absolute -top-3 left-6 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full">
                Step {index + 1}
              </div>
              
              {/* Icon - Removed bg-gray-50 class */}
              <div className="mb-4 p-3 rounded-xl">
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;