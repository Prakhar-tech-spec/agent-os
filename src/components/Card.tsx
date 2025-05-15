import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  showExpandIcon?: boolean;
  onExpand?: () => void;
  titleClassName?: string;
}

const Card = ({ title, children, className, showExpandIcon = true, onExpand, titleClassName }: CardProps) => {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm overflow-hidden", className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className={cn("text-lg font-semibold", titleClassName)}>{title}</h3>
        {showExpandIcon && (
          <button onClick={onExpand} className="text-gray-500 hover:text-gray-700">
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 14L14 6" stroke="#6C6F7F" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 6H14V13" stroke="#6C6F7F" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            </span>
          </button>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
