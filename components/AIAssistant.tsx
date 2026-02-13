import React from 'react';
import { FenceConfig } from '../types';

interface AIAssistantProps {
  config: FenceConfig;
}

/**
 * AI Assistant disabled
 * Keeping component so app doesn't crash
 */
const AIAssistant: React.FC<AIAssistantProps> = () => {
  return null;
};

export default AIAssistant;
