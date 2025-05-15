import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";

interface DataPoint {
  label: string;
  percentage: number;
}

interface BarChartProps {
  data: DataPoint[];
}

const GRADIENT_ID = "area-gradient";

// Use a modern blue-to-purple gradient
const AREA_GRADIENT_START = "#4F8CFF"; // blue
const AREA_GRADIENT_END = "#857FEB";   // purple
const LINE_COLOR = "#4F8CFF";
const DOT_COLOR = "#857FEB";

const AreaChart = ({ data }: BarChartProps) => {
  return (
    <div className="h-[220px] w-full flex items-end">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{
            top: 24,
            right: 24,
            left: 24,
            bottom: 12,
          }}
        >
          <defs>
            <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={AREA_GRADIENT_START} stopOpacity={0.7} />
              <stop offset="100%" stopColor={AREA_GRADIENT_END} stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#6b7280', fontWeight: 500 }} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{ borderRadius: 12, background: '#fff', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}
            itemStyle={{ color: AREA_GRADIENT_START, fontWeight: 600 }}
            formatter={(value) => [`${value}%`, "Value"]}
            labelFormatter={(label) => `${label}`}
          />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke={LINE_COLOR}
            strokeWidth={3}
            fill={`url(#${GRADIENT_ID})`}
            dot={{ r: 5, fill: DOT_COLOR, stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: DOT_COLOR, stroke: '#fff', strokeWidth: 3 }}
            isAnimationActive={true}
            animationDuration={900}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;
