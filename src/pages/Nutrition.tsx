
import React from 'react';
import { ChatUI } from '@/components/ChatUI';

const Nutrition: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">FiMe</h1>
        <p className="text-muted-foreground">Your Smart Nutrition Assistant</p>
      </div>
      
      <ChatUI />
    </div>
  );
};

export default Nutrition;
