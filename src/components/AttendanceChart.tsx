
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  time: string;
  day: string;
  value: number;
}

interface AttendanceChartProps {
  data: DataPoint[];
}

const AttendanceChart = ({ data }: AttendanceChartProps) => {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const times = ["08:00", "09:00", "10:00", "11:00"];
  
  // Create a 2D grid representation for the heatmap
  const heatmapData = daysOfWeek.map(day => {
    const dayData: any = { name: day };
    
    times.forEach(time => {
      const dataPoint = data.find(d => d.day === day && d.time === time);
      dayData[time] = dataPoint ? dataPoint.value : 0;
    });
    
    return dayData;
  });

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={heatmapData}>
          <XAxis dataKey="name" />
          <YAxis hide />
          <Tooltip 
            formatter={(value) => [value + '%', '']}
            labelFormatter={(label) => `Day: ${label}`}
          />
          {times.map((time, index) => (
            <Area 
              key={time}
              type="monotone"
              dataKey={time}
              stackId="1"
              stroke={`hsl(${210 + index * 20}, 80%, 60%)`}
              fill={`hsl(${210 + index * 20}, 80%, 85%)`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
