'use client';

import React, { useState } from 'react';
import { X, Loader2, TrendingUp, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import VitalTimelineChart from '../dashboard/VitalTimelineChart';
import AddReportModal from './AddReportModal';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientDetails: any;
  isLoading: boolean;
  selectedVital: string;
  setSelectedVital: (v: string) => void;
  chartData: any[];
  getVitalLabel: (k: string) => string;
  getVitalUnit: (k: string) => string;
}

export default function ClientDetailModal({
  isOpen,
  onClose,
  clientDetails,
  isLoading,
  selectedVital,
  setSelectedVital,
  chartData,
  getVitalLabel,
  getVitalUnit,
}: ClientDetailModalProps) {
  const queryClient = useQueryClient();
  const [showAddReportModal, setShowAddReportModal] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 relative neon-shadow-blue flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Clinical File: {clientDetails?.full_name || 'Loading...'}</h3>
            {clientDetails && (
              <span className="text-xs text-sky-400 font-mono">Patient ID: {clientDetails.client_id}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-center hover:text-red-400 transition-colors cursor-pointer text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex items-center justify-center flex-col gap-3">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
            <span className="text-xs text-slate-400">Loading Clinical File...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Age / Gender</span>
                <span className="text-white font-medium">{clientDetails?.age || 'N/A'} yrs / {clientDetails?.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Occupation</span>
                <span className="text-white font-medium">{clientDetails?.occupation || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Location</span>
                <span className="text-white font-medium">{clientDetails?.city ? `${clientDetails.city}, ${clientDetails.state}` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Contact Mobile</span>
                <span className="text-white font-medium">{clientDetails?.mobile || 'N/A'}</span>
              </div>
            </div>

            {/* Vitals Trends Plot */}
            <div className="border border-slate-800 rounded-2xl p-5 bg-slate-950/20">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-sky-400" /> Vitals History Analytics
                </h4>
                <select
                  value={selectedVital}
                  onChange={(e) => setSelectedVital(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-white rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="vitamin_d">Vitamin D Level</option>
                  <option value="cholesterol">Total Cholesterol</option>
                  <option value="blood_sugar_fasting">Fasting Blood Sugar</option>
                  <option value="hemoglobin">Hemoglobin Count</option>
                  <option value="bmi">Body Mass Index (BMI)</option>
                  <option value="creatinine">Creatinine Level</option>
                  <option value="urine_protein">Urine Protein</option>
                </select>
              </div>

              <div className="h-48 w-full">
                <VitalTimelineChart
                  data={chartData}
                  selectedVitalLabel={getVitalLabel(selectedVital)}
                  selectedVitalUnit={getVitalUnit(selectedVital)}
                />
              </div>
            </div>

            {/* Patient Reports Log */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-sky-400" /> Patient Medical Reports History
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddReportModal(true)}
                  className="bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 border border-sky-500/20 hover:border-sky-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                >
                  File New Report
                </button>
              </div>
              
              <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-2xl text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Report ID</th>
                      <th className="py-2.5 px-4 text-center">Hb (g/dL)</th>
                      <th className="py-2.5 px-4 text-center">Vit D (ng/mL)</th>
                      <th className="py-2.5 px-4 text-center">Chol (mg/dL)</th>
                      <th className="py-2.5 px-4 text-center">FBS (mg/dL)</th>
                      <th className="py-2.5 px-4 text-center">BMI</th>
                      <th className="py-2.5 px-4">Doctor Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {(!clientDetails?.health_reports || clientDetails.health_reports.length === 0) ? (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-500">
                          No reports filed on records.
                        </td>
                      </tr>
                    ) : (
                      clientDetails.health_reports.map((r: any) => (
                        <tr key={r.report_id} className="hover:bg-slate-900/30 text-slate-300">
                          <td className="py-2.5 px-4 font-semibold text-white whitespace-nowrap">
                            {new Date(r.report_date).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-sky-400">{r.report_id}</td>
                          <td className="py-2.5 px-4 text-center">{r.hemoglobin || '—'}</td>
                          <td className="py-2.5 px-4 text-center">{r.vitamin_d || '—'}</td>
                          <td className="py-2.5 px-4 text-center">{r.cholesterol || '—'}</td>
                          <td className="py-2.5 px-4 text-center">{r.blood_sugar_fasting || '—'}</td>
                          <td className="py-2.5 px-4 text-center">{r.bmi || '—'}</td>
                          <td className="py-2.5 px-4 text-slate-400 max-w-[150px] truncate" title={r.doctor_notes}>
                            {r.doctor_notes || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {clientDetails && (
          <AddReportModal
            isOpen={showAddReportModal}
            onClose={() => setShowAddReportModal(false)}
            clientId={clientDetails.client_id}
            onSuccess={() => {
              queryClient.invalidateQueries({
                queryKey: ['adminClientDetails', clientDetails.client_id],
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
