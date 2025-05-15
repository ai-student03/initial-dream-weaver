
import React from 'react';
import { ChatUI } from '@/components/ChatUI';

const Nutrition: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8 md:mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-[#8BC791] mb-2">FiMe</h1>
        <p className="text-[#6B7280] text-lg">Your Smart Nutrition Assistant</p>
      </div>
      
      <ChatUI />
    </div>
  );
};

export default Nutrition;
