'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface VitalTimelineChartProps {
  data: any[];
  selectedVitalLabel: string;
  selectedVitalUnit: string;
}

export default function VitalTimelineChart({
  data,
  selectedVitalLabel,
  selectedVitalUnit,
}: VitalTimelineChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-xs">
        Insufficient historical data points to plot timeline trends.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="date"
          stroke="#94a3b8"
          fontSize={10}
          tickLine={false}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={10}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            color: '#f8fafc',
            fontSize: '11px',
          }}
          labelFormatter={(label, items) => {
            if (items[0]) {
              return `Date: ${items[0].payload.fullDate}`;
            }
            return label;
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#0ea5e9"
          strokeWidth={2.5}
          dot={{ r: 3, stroke: '#0ea5e9', strokeWidth: 1.5, fill: '#070a13' }}
          activeDot={{ r: 5, stroke: '#38bdf8', strokeWidth: 1.5, fill: '#ffffff' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
