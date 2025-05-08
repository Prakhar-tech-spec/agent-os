
import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  showExpandIcon?: boolean;
  onExpand?: () => void;
}

const Card = ({ title, children, className, showExpandIcon = true, onExpand }: CardProps) => {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm overflow-hidden", className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold">{title}</h3>
        {showExpandIcon && (
          <button onClick={onExpand} className="text-gray-500 hover:text-gray-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
