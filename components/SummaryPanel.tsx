import React from 'react';
import { FenceConfig, TrellisType } from '../types';
import { PRICE_PER_PANEL, PRICE_POST, PRICE_TRELLIS } from '../constants';
import { ShoppingCart } from 'lucide-react';

interface SummaryPanelProps {
  config: FenceConfig;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ config }) => {
  
  const numPanels = config.width;
  const numPosts = config.width + 1;
  const hasTrellis = config.trellisType !== TrellisType.NONE;

  const panelCost = numPanels * PRICE_PER_PANEL;
  const postCost = numPosts * PRICE_POST;
  const trellisCost = hasTrellis ? numPanels * PRICE_TRELLIS : 0;
  
  const total = panelCost + postCost + trellisCost;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full md:w-auto min-w-[280px]">
      <div className="flex items-center gap-2 text-gray-800 font-bold mb-3 pb-2 border-b">
        <ShoppingCart size={18} /> Estimate Summary
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>{numPanels} x Panels ({config.height}mm)</span>
          <span>£{panelCost}</span>
        </div>
        <div className="flex justify-between">
           <span>{numPosts} x Posts</span>
           <span>£{postCost}</span>
        </div>
        {hasTrellis && (
          <div className="flex justify-between">
            <span>{numPanels} x Trellis ({config.trellisType})</span>
            <span>£{trellisCost}</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
        <span className="font-semibold text-gray-800">Total (Ex. VAT)</span>
        <span className="text-xl font-bold text-blue-700">£{total}</span>
      </div>
      
      <button 
        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors shadow-sm"
        onClick={() => alert("This would proceed to checkout or save your design!")}
      >
        Proceed to Order
      </button>
    </div>
  );
};

export default SummaryPanel;
