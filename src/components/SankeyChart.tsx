
import { Card } from "@/components/ui/card";
import React from "react";

const SankeyChart = () => {
  return (
    <div className="relative h-64 w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Sankey chart visualization</p>
          <p className="text-sm">(Employee Movement visualization)</p>
        </div>
      </div>
      
      {/* Simplified representation of the Sankey chart from the screenshot */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-10 w-8 bg-brand-purple opacity-80 rounded-r"></div>
        <div className="absolute left-0 top-12 h-10 w-8 bg-brand-blue opacity-80 rounded-r"></div>
        <div className="absolute left-0 top-24 h-10 w-8 bg-brand-green opacity-80 rounded-r"></div>
        <div className="absolute left-0 top-36 h-10 w-8 bg-brand-orange opacity-80 rounded-r"></div>
        <div className="absolute left-0 top-48 h-10 w-8 bg-brand-yellow opacity-80 rounded-r"></div>
        
        <div className="absolute right-0 top-12 h-10 w-8 bg-brand-yellow opacity-80 rounded-l"></div>
        <div className="absolute right-0 top-24 h-10 w-8 bg-brand-orange opacity-80 rounded-l"></div>
        <div className="absolute right-0 top-36 h-10 w-8 bg-brand-green opacity-80 rounded-l"></div>
        
        <svg className="absolute inset-0 w-full h-full">
          <path d="M32,15 C100,15 100,55 168,55" stroke="#857FEB" fill="none" strokeWidth="20" opacity="0.2" />
          <path d="M32,35 C100,35 100,75 168,75" stroke="#0088FF" fill="none" strokeWidth="20" opacity="0.2" />
          <path d="M32,55 C100,55 100,95 168,95" stroke="#49B195" fill="none" strokeWidth="20" opacity="0.2" />
          <path d="M32,75 C100,75 100,115 168,115" stroke="#FD8A56" fill="none" strokeWidth="20" opacity="0.2" />
          <path d="M32,95 C100,95 100,135 168,135" stroke="#F9D97B" fill="none" strokeWidth="20" opacity="0.2" />
        </svg>
      </div>
      
      <div className="absolute left-2 top-0 text-xs text-gray-600">HR</div>
      <div className="absolute left-2 top-12 text-xs text-gray-600">Finance</div>
      <div className="absolute left-2 top-24 text-xs text-gray-600">Sales</div>
      <div className="absolute left-2 top-36 text-xs text-gray-600">Support</div>
      <div className="absolute left-2 top-48 text-xs text-gray-600">Development</div>
      
      <div className="absolute right-8 top-0 text-xs text-right text-gray-600">High</div>
      <div className="absolute right-8 top-24 text-xs text-right text-gray-600">Medium</div>
      <div className="absolute right-8 top-48 text-xs text-right text-gray-600">Low</div>
      
      <div className="absolute bottom-2 left-0 text-xs text-gray-600">Department</div>
      <div className="absolute bottom-2 right-0 text-xs text-gray-600">Potential</div>
    </div>
  );
};

export default SankeyChart;
