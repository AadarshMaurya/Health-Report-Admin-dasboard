'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  LogOut,
  User as UserIcon,
  Calendar,
  Heart,
  FileText,
  Clock,
  MapPin,
  Briefcase,
  AlertCircle,
  Lock,
  TrendingUp
} from 'lucide-react';
import { apiRequest, clearTokens, getUserProfile } from '../../lib/api';
import ChangePasswordModal from '../../../components/ui/ChangePasswordModal';
import VitalCard from '../../../components/dashboard/VitalCard';
import VitalTimelineChart from '../../../components/dashboard/VitalTimelineChart';
import PatientProfileCard from '../../../components/dashboard/PatientProfileCard';
import ClinicalHistoryLog from '../../../components/dashboard/ClinicalHistoryLog';

export default function UserDashboard() {
  const router = useRouter();
  const [selectedVital, setSelectedVital] = useState<string>('vitamin_d');
  const [isClient, setIsClient] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Guard against hydration mismatch
  useEffect(() => {
    setIsClient(true);
    const profile = getUserProfile();
    if (!profile) {
      router.push('/login');
    } else if (profile.role !== 'USER') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  // Query: User profile & client bio details
  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => apiRequest('/me'),
    enabled: isClient,
  });

  // Query: Latest report card
  const { data: latestReport, isLoading: isLatestLoading } = useQuery({
    queryKey: ['latestReport'],
    queryFn: () => apiRequest('/me/latest-report'),
    enabled: isClient,
  });

  // Query: Report history
  const { data: reportHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['reportHistory'],
    queryFn: () => apiRequest('/me/report-history'),
    enabled: isClient,
  });

  const handleSignOut = () => {
    clearTokens();
    router.push('/login');
  };

  const getVitalStatus = (name: string, value: number) => {
    if (value === null || value === undefined) return { label: 'N/A', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    
    switch (name) {
      case 'hemoglobin':
        if (value < 12) return { label: 'Low', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
        if (value > 17.5) return { label: 'High', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
        return { label: 'Normal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'vitamin_d':
        if (value < 20) return { label: 'Deficient', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
        if (value < 30) return { label: 'Insufficient', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        return { label: 'Sufficient', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'cholesterol':
        if (value >= 240) return { label: 'High', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
        if (value >= 200) return { label: 'Borderline', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        return { label: 'Optimal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'blood_sugar_fasting':
        if (value < 70) return { label: 'Low', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
        if (value >= 126) return { label: 'Diabetic', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
        if (value >= 100) return { label: 'Prediabetic', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        return { label: 'Normal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'creatinine':
        if (value < 0.6) return { label: 'Low', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
        if (value > 1.3) return { label: 'High', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
        return { label: 'Normal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'bmi':
        if (value < 18.5) return { label: 'Underweight', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
        if (value >= 30) return { label: 'Obese', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
        if (value >= 25) return { label: 'Overweight', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
        return { label: 'Normal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      default:
        return { label: 'Measured', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  const getVitalLabel = (key: string) => {
    switch (key) {
      case 'hemoglobin': return 'Hemoglobin';
      case 'vitamin_d': return 'Vitamin D';
      case 'cholesterol': return 'Cholesterol';
      case 'blood_sugar_fasting': return 'Fasting Blood Sugar';
      case 'creatinine': return 'Creatinine';
      case 'urine_protein': return 'Urine Protein';
      case 'bmi': return 'BMI';
      default: return key;
    }
  };

  const getVitalUnit = (key: string) => {
    switch (key) {
      case 'hemoglobin': return 'g/dL';
      case 'vitamin_d': return 'ng/mL';
      case 'cholesterol': return 'mg/dL';
      case 'blood_sugar_fasting': return 'mg/dL';
      case 'creatinine': return 'mg/dL';
      case 'urine_protein': return 'g/L';
      case 'bmi': return 'kg/m²';
      default: return '';
    }
  };

  if (!isClient || isProfileLoading || isLatestLoading || isHistoryLoading) {
    return (
      <div className="min-h-screen bg-[#070a13] flex items-center justify-center flex-col gap-4">
        <Activity className="w-12 h-12 text-sky-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading Clinical Records...</span>
      </div>
    );
  }

  if (profileError || !profileData) {
    return (
      <div className="min-h-screen bg-[#070a13] flex items-center justify-center flex-col gap-4 p-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <span className="text-lg text-white font-medium">Error Syncing Clinical Profile</span>
        <button onClick={handleSignOut} className="px-4 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 text-sm">
          Return to Login
        </button>
      </div>
    );
  }

  const client = profileData.client;
  const reports = reportHistory || [];
  
  const chartData = [...reports]
    .reverse()
    .map((r: any) => ({
      date: new Date(r.report_date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      value: parseFloat(r[selectedVital]) || 0,
      fullDate: new Date(r.report_date).toLocaleDateString(),
    }))
    .filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col">
      {/* Top Navbar */}
      <header className="glass-panel sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">CLINITECH</h1>
            <p className="text-xs text-slate-400">Client Clinical Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-white">{client?.full_name || 'Guest User'}</div>
            <div className="text-xs text-slate-400">{profileData.user.email}</div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-400 transition-all cursor-pointer text-slate-400"
            title="Change Password"
          >
            <Lock className="w-5 h-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer text-slate-400"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Client Profile Card */}
        <section className="lg:col-span-1 space-y-6">
          <PatientProfileCard client={client} />
        </section>

        {/* Right Dashboard Area */}
        <section className="lg:col-span-3 space-y-6">
          {/* Latest Report Panel */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-sky-500" />
                Latest Vitals Panel
              </h3>
              {latestReport && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Recorded on: {new Date(latestReport.report_date).toLocaleDateString()}
                </span>
              )}
            </div>

            {!latestReport ? (
              <div className="glass-panel rounded-3xl p-8 text-center text-slate-400">
                No health reports are available on your profile.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <VitalCard name="hemoglobin" label="Hemoglobin" value={latestReport.hemoglobin} unit={getVitalUnit('hemoglobin')} optimalRange="12 - 17.5 g/dL" getVitalStatus={getVitalStatus} />
                <VitalCard name="vitamin_d" label="Vitamin D" value={latestReport.vitamin_d} unit={getVitalUnit('vitamin_d')} optimalRange="30 - 100 ng/mL" getVitalStatus={getVitalStatus} />
                <VitalCard name="cholesterol" label="Total Cholesterol" value={latestReport.cholesterol} unit={getVitalUnit('cholesterol')} optimalRange="< 200 mg/dL" getVitalStatus={getVitalStatus} />
                <VitalCard name="blood_sugar_fasting" label="Fasting Blood Sugar" value={latestReport.blood_sugar_fasting} unit={getVitalUnit('blood_sugar_fasting')} optimalRange="70 - 100 mg/dL" getVitalStatus={getVitalStatus} />
                <VitalCard name="creatinine" label="Creatinine" value={latestReport.creatinine} unit={getVitalUnit('creatinine')} optimalRange="0.6 - 1.2 mg/dL" getVitalStatus={getVitalStatus} />
                <VitalCard name="bmi" label="Body Mass Index (BMI)" value={latestReport.bmi} unit={getVitalUnit('bmi')} optimalRange="18.5 - 24.9" getVitalStatus={getVitalStatus} />
              </div>
            )}
          </div>

          {/* Health Trend Charts */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-500" />
                Vitals Timeline Analytics
              </h3>
              
              <select
                value={selectedVital}
                onChange={(e) => setSelectedVital(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
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

            <div className="h-64 w-full">
              <VitalTimelineChart
                data={chartData}
                selectedVitalLabel={getVitalLabel(selectedVital)}
                selectedVitalUnit={getVitalUnit(selectedVital)}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                Visualizing <span className="font-semibold text-sky-400">{getVitalLabel(selectedVital)}</span> trends ({getVitalUnit(selectedVital)}) across your recorded clinical sessions.
              </p>
            </div>
          </div>

          {/* Doctor Notes */}
          {latestReport?.doctor_notes && (
            <div className="glass-panel rounded-3xl p-6 bg-sky-950/20 border border-sky-500/10">
              <h4 className="text-sm font-semibold text-sky-400 flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4" /> Doctor Clinical Recommendation
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                &ldquo;{latestReport.doctor_notes}&rdquo;
              </p>
            </div>
          )}

          {/* Report History Table */}
          <ClinicalHistoryLog reports={reports} />
        </section>
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
}
