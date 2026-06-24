'use client';

import React from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface BulkImporterProps {
  uploadFile: File | null;
  onFileSelect: (file: File | null) => void;
  isPending: boolean;
  onUpload: () => void;
}

export default function BulkImporter({
  uploadFile,
  onFileSelect,
  isPending,
  onUpload,
}: BulkImporterProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-teal-500/5 blur-2xl pointer-events-none" />
      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bulk Import Widget</span>
      <div className="flex items-center gap-2 mt-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-2"
        >
          <Upload className="w-4 h-4 text-sky-400" />
          {uploadFile ? 'Change File' : 'Select Sheet File'}
        </button>
        {uploadFile && (
          <button
            onClick={onUpload}
            disabled={isPending}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              'Upload'
            )}
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-2.5 font-sans">
        {uploadFile ? `Selected: ${uploadFile.name}` : 'Supports CSV and Excel templates'}
      </p>
    </div>
  );
}
