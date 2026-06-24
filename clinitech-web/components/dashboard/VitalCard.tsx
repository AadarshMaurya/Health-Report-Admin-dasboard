'use client';

import React from 'react';

interface VitalCardProps {
  name: string;
  label: string;
  value: number | null | undefined;
  unit: string;
  optimalRange: string;
  getVitalStatus: (name: string, value: number) => { label: string; color: string };
}

export default function VitalCard({
  name,
  label,
  value,
  unit,
  optimalRange,
  getVitalStatus,
}: VitalCardProps) {
  const status = value !== null && value !== undefined 
    ? getVitalStatus(name, value) 
    : { label: 'N/A', color: 'bg-slate-850 text-slate-500 border-slate-800' };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-850">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-400">{label}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${status.color}`}>
          {status.label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value !== null && value !== undefined ? value : 'N/A'}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      <div className="text-[10px] text-slate-500 mt-2">Optimal range: {optimalRange}</div>
    </div>
  );
}
