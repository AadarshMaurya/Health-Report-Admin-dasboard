'use client';

import React, { useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { apiRequest } from '../../app/lib/api';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSuccess?: () => void;
}

export default function AddReportModal({ isOpen, onClose, clientId, onSuccess }: AddReportModalProps) {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [hemoglobin, setHemoglobin] = useState('');
  const [vitaminD, setVitaminD] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [creatinine, setCreatinine] = useState('');
  const [urineProtein, setUrineProtein] = useState('');
  const [bmi, setBmi] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Generate a unique report ID
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const reportId = `R${Date.now().toString().slice(-4)}${randomDigits}`;

      const payload = {
        report_id: reportId,
        client_id: clientId,
        report_date: new Date(reportDate).toISOString(),
        hemoglobin: hemoglobin ? parseFloat(hemoglobin) : null,
        vitamin_d: vitaminD ? parseFloat(vitaminD) : null,
        cholesterol: cholesterol ? parseFloat(cholesterol) : null,
        blood_sugar_fasting: bloodSugar ? parseFloat(bloodSugar) : null,
        creatinine: creatinine ? parseFloat(creatinine) : null,
        urine_protein: urineProtein ? parseFloat(urineProtein) : null,
        bmi: bmi ? parseFloat(bmi) : null,
        doctor_notes: doctorNotes || null,
      };

      await apiRequest('/admin/upload-health-report', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccess('Health report filed successfully!');
      setHemoglobin('');
      setVitaminD('');
      setCholesterol('');
      setBloodSugar('');
      setCreatinine('');
      setUrineProtein('');
      setBmi('');
      setDoctorNotes('');

      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to file health report');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#000000]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 relative neon-shadow-blue flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-500" />
            File New Medical Report
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center hover:text-red-400 cursor-pointer text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Report Date</label>
            <input
              type="date"
              required
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hemoglobin (g/dL)</label>
              <input
                type="number"
                step="0.01"
                value={hemoglobin}
                onChange={(e) => setHemoglobin(e.target.value)}
                placeholder="e.g. 14.2"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vitamin D (ng/mL)</label>
              <input
                type="number"
                step="0.01"
                value={vitaminD}
                onChange={(e) => setVitaminD(e.target.value)}
                placeholder="e.g. 32.5"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Cholesterol (mg/dL)</label>
              <input
                type="number"
                step="0.01"
                value={cholesterol}
                onChange={(e) => setCholesterol(e.target.value)}
                placeholder="e.g. 185"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fasting Blood Sugar (mg/dL)</label>
              <input
                type="number"
                step="0.01"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                placeholder="e.g. 95"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Creatinine (mg/dL)</label>
              <input
                type="number"
                step="0.01"
                value={creatinine}
                onChange={(e) => setCreatinine(e.target.value)}
                placeholder="e.g. 0.9"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Urine Protein (g/L)</label>
              <input
                type="number"
                step="0.01"
                value={urineProtein}
                onChange={(e) => setUrineProtein(e.target.value)}
                placeholder="e.g. 0.15"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BMI</label>
              <input
                type="number"
                step="0.01"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                placeholder="e.g. 22.4"
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Doctor Notes & Recommendations</label>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Describe recommendations and treatments..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Filing...
                </>
              ) : (
                'File Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
