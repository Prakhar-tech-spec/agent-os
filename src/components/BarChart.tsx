
import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DataPoint {
  label: string;
  percentage: number;
}

interface BarChartProps {
  data: DataPoint[];
}

const BarChart = ({ data }: BarChartProps) => {
  const getBarColor = (index: number) => {
    const colors = ['#E57373', '#9575CD', '#64B5F6', '#FFF176', '#81C784'];
    return colors[index % colors.length];
  };

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 20,
          }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            formatter={(value) => [`${value}%`, "Response"]}
            labelFormatter={(label) => `${label}`}
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
          />
          {data.map((entry, index) => (
            <Bar 
              key={`bar-${index}`}
              dataKey="percentage" 
              fill={getBarColor(index)}
              radius={[5, 5, 0, 0]}
            >
              {data.map((_, i) => (
                <Cell 
                  key={`cell-${i}`}
                  fill={getBarColor(i)}
                />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
