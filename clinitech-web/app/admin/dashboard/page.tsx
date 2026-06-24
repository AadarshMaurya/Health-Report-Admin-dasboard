'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  LogOut,
  X,
  CheckCircle,
  AlertCircle,
  Lock,
  UserPlus
} from 'lucide-react';
import { apiRequest, clearTokens, getUserProfile } from '../../lib/api';

import BulkImporter from '../../../components/admin/BulkImporter';
import ClientDetailModal from '../../../components/admin/ClientDetailModal';
import ChangePasswordModal from '../../../components/ui/ChangePasswordModal';
import CreateAccountModal from '../../../components/admin/CreateAccountModal';
import EditClientModal from '../../../components/admin/EditClientModal';
import ClientTable from '../../../components/admin/ClientTable';
import DirectoryFilters from '../../../components/admin/DirectoryFilters';
import DeleteConfirmModal from '../../../components/admin/DeleteConfirmModal';

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Filter and pagination state
  const [isClient, setIsClient] = useState(false);
  const [page, setPage] = useState(1);
  const [searchVal, setSearchVal] = useState('');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [jumpPageVal, setJumpPageVal] = useState('');

  // Modal / Detail state
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedVital, setSelectedVital] = useState<string>('vitamin_d');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEditClient, setSelectedEditClient] = useState<any | null>(null);
  const [selectedDeleteClient, setSelectedDeleteClient] = useState<any | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // File Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean;
    message?: string;
    total?: number;
    imported?: number;
    skipped?: number;
  } | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Authenticate user & ensure role is ADMIN
  useEffect(() => {
    setIsClient(true);
    const profile = getUserProfile();
    if (!profile) {
      router.push('/login');
    } else if (profile.role !== 'ADMIN') {
      router.push('/user/dashboard');
    } else {
      setAdminUser(profile);
    }
  }, [router]);

  // Debounce search input to avoid spamming backend query API
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchVal);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Query: Paginated clients list (dependent on search, filters, sorting, page)
  const { data: clientsData, isLoading: isClientsLoading } = useQuery({
    queryKey: ['adminClients', page, search, cityFilter, conditionFilter, sortBy, sortOrder],
    queryFn: () =>
      apiRequest(
        `/admin/clients?page=${page}&limit=12&search=${encodeURIComponent(
          search
        )}&city=${encodeURIComponent(cityFilter)}&healthCondition=${encodeURIComponent(
          conditionFilter
        )}&sortBy=${sortBy}&sortOrder=${sortOrder}`
      ),
    enabled: isClient,
  });

  // Query: Individual client details
  const { data: clientDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['adminClientDetails', selectedClientId],
    queryFn: () => apiRequest(`/admin/clients/${selectedClientId}`),
    enabled: isClient && !!selectedClientId,
  });

  // Mutation: Bulk upload CSV / Excel report file
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiRequest('/admin/upload-health-report', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (data) => {
      setUploadStatus({
        success: true,
        message: data.message || 'File uploaded successfully',
        total: data.total_rows_found,
        imported: data.successfully_imported,
        skipped: data.skipped_missing_clients_count,
      });
      setUploadFile(null);
      // Invalidate queries to refresh lists and dropdown filters
      queryClient.invalidateQueries({ queryKey: ['adminClients'] });
    },
    onError: (err: any) => {
      setUploadStatus({
        success: false,
        message: err.message || 'Bulk import failed. Please verify the sheet headers.',
      });
    },
  });

  const handleSignOut = () => {
    clearTokens();
    router.push('/login');
  };

  const triggerUpload = () => {
    if (uploadFile) {
      setUploadStatus(null);
      uploadMutation.mutate(uploadFile);
    }
  };

  const handleRowClick = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleDeleteClient = (client: any) => {
    setSelectedDeleteClient(client);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDeleteClient) return;
    setIsDeleteLoading(true);
    try {
      await apiRequest(`/admin/clients/${selectedDeleteClient.client_id}`, {
        method: 'DELETE',
      });
      queryClient.invalidateQueries({ queryKey: ['adminClients'] });
      setSelectedDeleteClient(null);
      alert('Patient record deleted successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete client record.');
    } finally {
      setIsDeleteLoading(false);
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

  if (!isClient || (isClientsLoading && !clientsData)) {
    return (
      <div className="min-h-screen bg-[#070a13] flex items-center justify-center flex-col gap-4">
        <Activity className="w-12 h-12 text-sky-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading Clinitech Directory...</span>
      </div>
    );
  }

  const clients = clientsData?.data || [];
  const filters = clientsData?.filters || { cities: [], health_conditions: [] };
  const meta = clientsData?.meta || { total: 0, page: 1, limit: 12, last_page: 1 };

  // Prepare chart details for client modal
  const reports = clientDetails?.health_reports || [];
  const chartData = [...reports]
    .reverse()
    .map((r: any) => ({
      date: new Date(r.report_date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      value: parseFloat(r[selectedVital]) || 0,
      fullDate: new Date(r.report_date).toLocaleDateString(),
    }))
    .filter((d) => d.value > 0);

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
            <p className="text-xs text-sky-400">Clinical Administration Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-white font-sans">Administrator</div>
            <div className="text-xs text-sky-400 font-mono">{adminUser?.email || 'admin@clinitech.com'}</div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 h-10 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center gap-1.5 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all cursor-pointer text-slate-400 text-xs font-semibold"
            title="Create User or Admin Account"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Account</span>
          </button>

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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Top Aggregates Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-sky-500/5 blur-2xl pointer-events-none" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Registered Clients</span>
            <div className="text-4xl font-extrabold text-white mt-2">{meta.total}</div>
            <p className="text-xs text-slate-500 mt-2">Active client profiles on records</p>
          </div>

          <BulkImporter
            uploadFile={uploadFile}
            onFileSelect={setUploadFile}
            isPending={uploadMutation.isPending}
            onUpload={triggerUpload}
          />

          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Dynamic Cities & Filters</span>
            <div className="text-4xl font-extrabold text-teal-400 mt-2">
              {filters.cities.length}
            </div>
            <p className="text-xs text-slate-500 mt-2">Unique regions tracked globally</p>
          </div>
        </section>

        {/* Upload Status Overlay / Banner */}
        {uploadStatus && (
          <section className={`p-4 rounded-2xl border ${
            uploadStatus.success 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' 
              : 'bg-red-500/10 border-red-500/20 text-red-200'
          } flex justify-between items-start gap-4`}>
            <div className="flex items-start gap-3">
              {uploadStatus.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-semibold">{uploadStatus.message}</h4>
                {uploadStatus.success && (
                  <p className="text-xs text-slate-400 mt-1">
                    Rows found: <span className="text-white font-bold">{uploadStatus.total}</span> | 
                    Imported: <span className="text-emerald-400 font-bold">{uploadStatus.imported}</span> | 
                    Skipped (No client): <span className="text-amber-400 font-bold">{uploadStatus.skipped}</span>
                  </p>
                )}
              </div>
            </div>
            <button onClick={() => setUploadStatus(null)} className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </section>
        )}

        {/* Directory Controls Panel */}
        <DirectoryFilters
          searchVal={searchVal}
          setSearchVal={setSearchVal}
          isClientsLoading={isClientsLoading}
          cityFilter={cityFilter}
          setCityFilter={(val) => {
            setCityFilter(val);
            setPage(1);
          }}
          conditionFilter={conditionFilter}
          setConditionFilter={(val) => {
            setConditionFilter(val);
            setPage(1);
          }}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          cities={filters.cities}
          healthConditions={filters.health_conditions}
        />

        {/* Directory Grid/Table */}
        <section className="glass-panel rounded-3xl overflow-hidden">
          <ClientTable
            clients={clients}
            onRowClick={handleRowClick}
            onEditClick={(c) => setSelectedEditClient(c)}
            onDeleteClick={handleDeleteClient}
          />

          {/* Pagination Controls */}
          {meta.last_page > 1 && (
            <div className="border-t border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              <span className="text-slate-400">
                Showing page <span className="text-white font-semibold">{meta.page}</span> of <span className="text-white font-semibold">{meta.last_page}</span> ({meta.total} records total)
              </span>
              
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white px-2.5 py-1.5 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>

                {(() => {
                  const pages = [];
                  const lastPage = meta.last_page;
                  if (lastPage <= 7) {
                    for (let i = 1; i <= lastPage; i++) pages.push(i);
                  } else {
                    if (page <= 4) {
                      pages.push(1, 2, 3, 4, 5, '...', lastPage);
                    } else if (page >= lastPage - 3) {
                      pages.push(1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage);
                    } else {
                      pages.push(1, '...', page - 1, page, page + 1, '...', lastPage);
                    }
                  }
                  return pages;
                })().map((pageNum, idx) => {
                  if (pageNum === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-500 select-none">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => setPage(pageNum as number)}
                      className={`px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all duration-150 ${
                        page === pageNum
                          ? 'bg-sky-600 border-sky-600 text-white font-semibold shadow-md shadow-sky-600/10'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, meta.last_page))}
                  disabled={page === meta.last_page}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white px-2.5 py-1.5 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>

              {/* Direct Jump to Page form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const pNum = parseInt(jumpPageVal, 10);
                  if (!isNaN(pNum) && pNum >= 1 && pNum <= meta.last_page) {
                    setPage(pNum);
                    setJumpPageVal('');
                  }
                }}
                className="flex items-center gap-2"
              >
                <span className="text-slate-400">Go to:</span>
                <input
                  type="text"
                  placeholder={`1-${meta.last_page}`}
                  value={jumpPageVal}
                  onChange={(e) => setJumpPageVal(e.target.value)}
                  className="w-16 bg-slate-900 border border-slate-800 text-white rounded-xl px-2.5 py-1 text-center text-xs focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-white px-2.5 py-1 rounded-xl text-xs cursor-pointer font-medium hover:border-slate-700 transition-colors"
                >
                  Go
                </button>
              </form>
            </div>
          )}
        </section>
      </main>

      {/* Modals & Overlays */}
      <ClientDetailModal
        isOpen={!!selectedClientId}
        onClose={() => setSelectedClientId(null)}
        clientDetails={clientDetails}
        isLoading={isDetailsLoading}
        selectedVital={selectedVital}
        setSelectedVital={setSelectedVital}
        chartData={chartData}
        getVitalLabel={getVitalLabel}
        getVitalUnit={getVitalUnit}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['adminClients'] })}
      />

      <EditClientModal
        isOpen={!!selectedEditClient}
        onClose={() => setSelectedEditClient(null)}
        client={selectedEditClient}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['adminClients'] })}
      />

      <DeleteConfirmModal
        isOpen={!!selectedDeleteClient}
        onClose={() => setSelectedDeleteClient(null)}
        client={selectedDeleteClient}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleteLoading}
      />
    </div>
  );
}
