'use client';

import React from 'react';
import { Eye, Pencil, Trash } from 'lucide-react';

interface Client {
  client_id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  city: string | null;
  state: string | null;
  health_condition: string | null;
  email: string | null;
  mobile: string | null;
  occupation: string | null;
  beauty_goal: string | null;
}

interface ClientTableProps {
  clients: Client[];
  onRowClick: (clientId: string) => void;
  onEditClick: (client: Client) => void;
  onDeleteClick: (client: Client) => void;
}

export default function ClientTable({ clients, onRowClick, onEditClick, onDeleteClick }: ClientTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
            <th className="py-4 px-6">ID</th>
            <th className="py-4 px-6">Name</th>
            <th className="py-4 px-6">Age / Gender</th>
            <th className="py-4 px-6">Location</th>
            <th className="py-4 px-6">Condition</th>
            <th className="py-4 px-6">Email</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-850">
          {clients.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-slate-500">
                No matching client profiles found.
              </td>
            </tr>
          ) : (
            clients.map((c) => (
              <tr
                key={c.client_id}
                onClick={() => onRowClick(c.client_id)}
                className="hover:bg-slate-900/40 text-slate-300 transition-colors cursor-pointer group"
              >
                <td className="py-4 px-6 font-mono text-xs font-semibold text-sky-400">{c.client_id}</td>
                <td className="py-4 px-6 font-semibold text-white group-hover:text-sky-300 transition-colors">
                  {c.full_name}
                </td>
                <td className="py-4 px-6">
                  {c.age || '—'} yrs / {c.gender || '—'}
                </td>
                <td className="py-4 px-6">
                  {c.city ? `${c.city}, ${c.state}` : '—'}
                </td>
                <td className="py-4 px-6">
                  <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs">
                    {c.health_condition || 'None'}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-400">{c.email || '—'}</td>
                <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(c.client_id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all cursor-pointer"
                      title="View Clinical Records"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClick(c);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-pointer"
                      title="Edit Profile"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(c);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
