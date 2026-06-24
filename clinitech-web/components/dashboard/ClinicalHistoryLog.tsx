'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface Report {
  report_id: string;
  report_date: string;
  hemoglobin: number | null;
  vitamin_d: number | null;
  cholesterol: number | null;
  blood_sugar_fasting: number | null;
  bmi: number | null;
  doctor_notes: string | null;
}

interface ClinicalHistoryLogProps {
  reports: Report[];
}

export default function ClinicalHistoryLog({ reports }: ClinicalHistoryLogProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 overflow-hidden">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-sky-500" />
        Clinical History Log
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Report ID</th>
              <th className="py-3 px-4 text-center">Hb (g/dL)</th>
              <th className="py-3 px-4 text-center">Vit D (ng/mL)</th>
              <th className="py-3 px-4 text-center">Chol (mg/dL)</th>
              <th className="py-3 px-4 text-center">FBS (mg/dL)</th>
              <th className="py-3 px-4 text-center">BMI</th>
              <th className="py-3 px-4">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No historical records found on file.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.report_id} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white whitespace-nowrap">
                    {new Date(report.report_date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-sky-400">{report.report_id}</td>
                  <td className="py-3.5 px-4 text-center">{report.hemoglobin ?? '—'}</td>
                  <td className="py-3.5 px-4 text-center">{report.vitamin_d ?? '—'}</td>
                  <td className="py-3.5 px-4 text-center">{report.cholesterol ?? '—'}</td>
                  <td className="py-3.5 px-4 text-center">{report.blood_sugar_fasting ?? '—'}</td>
                  <td className="py-3.5 px-4 text-center font-medium">{report.bmi ?? '—'}</td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate" title={report.doctor_notes || ''}>
                    {report.doctor_notes || <span className="text-slate-600">No notes</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
