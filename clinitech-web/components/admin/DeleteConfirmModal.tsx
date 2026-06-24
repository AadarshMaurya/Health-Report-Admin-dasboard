'use client';

import React from 'react';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface Client {
  client_id: string;
  full_name: string;
  email: string | null;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  client,
  onConfirm,
  isLoading,
}: DeleteConfirmModalProps) {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative neon-shadow-red flex flex-col border border-red-500/20 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Confirm Delete Record
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center hover:text-red-400 cursor-pointer text-slate-400 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="space-y-4 text-slate-300 py-2">
          <p className="text-sm">
            Are you sure you want to permanently delete the profile for patient:
          </p>
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/10 text-center space-y-1">
            <span className="text-base font-bold text-white block">{client.full_name}</span>
            <span className="text-xs text-slate-400 font-mono block">Patient ID: {client.client_id}</span>
            {client.email && (
              <span className="text-xs text-sky-400 font-mono block">{client.email}</span>
            )}
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-200/90 leading-relaxed text-[11px]">
            <strong>Warning:</strong> This action is destructive and cannot be undone. It will permanently purge:
            <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
              <li>Demographics and metadata profile details.</li>
              <li>All historical vitals, health files, and clinic reports.</li>
              <li>The patient login credentials (they will no longer be able to sign in).</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
