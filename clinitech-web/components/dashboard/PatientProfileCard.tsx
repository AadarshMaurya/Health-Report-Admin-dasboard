'use client';

import React from 'react';
import { User as UserIcon, Briefcase, MapPin } from 'lucide-react';

interface Client {
  client_id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  occupation: string | null;
  city: string | null;
  state: string | null;
  health_condition: string | null;
  beauty_goal: string | null;
}

interface PatientProfileCardProps {
  client: Client;
}

export default function PatientProfileCard({ client }: PatientProfileCardProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-sky-500/5 blur-2xl pointer-events-none" />

      <div className="flex flex-col items-center text-center pb-6 border-b border-slate-800">
        <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
          <UserIcon className="w-10 h-10 text-sky-400" />
        </div>
        <h2 className="text-xl font-bold text-white">{client?.full_name || 'Unknown Patient'}</h2>
        <span className="text-xs px-2.5 py-1 bg-sky-500/10 text-sky-400 rounded-full font-semibold border border-sky-500/20 mt-2 animate-pulse">
          Patient ID: {client?.client_id || 'N/A'}
        </span>
      </div>

      <div className="space-y-4 pt-6 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Age / Gender</span>
          <span className="text-white font-medium">
            {client?.age || 'N/A'} yrs / {client?.gender || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-slate-500" /> Occupation
          </span>
          <span className="text-white font-medium">{client?.occupation || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-500" /> Location
          </span>
          <span className="text-white font-medium">
            {client?.city ? `${client.city}, ${client.state}` : 'N/A'}
          </span>
        </div>
        <div className="pt-4 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Diagnosed Condition
          </span>
          <span className="text-white bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 block font-medium">
            {client?.health_condition || 'No active clinical condition recorded'}
          </span>
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Wellness & Beauty Goal
          </span>
          <span className="text-white bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 block font-medium">
            {client?.beauty_goal || 'None specified'}
          </span>
        </div>
      </div>
    </div>
  );
}
