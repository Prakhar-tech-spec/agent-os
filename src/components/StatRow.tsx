
import React from "react";

interface StatRowProps {
  label: string;
  value: number;
  suffix?: string;
}

const StatRow = ({ label, value, suffix = "%" }: StatRowProps) => {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 bg-gray-50 px-4 rounded-md my-1.5">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{value}{suffix}</span>
        <span className="text-xs text-gray-500">Employee</span>
      </div>
    </div>
  );
};

export default StatRow;
