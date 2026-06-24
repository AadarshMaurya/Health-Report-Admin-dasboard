'use client';

import React from 'react';
import { Search, Loader2, ArrowUpDown, ListFilter } from 'lucide-react';

interface DirectoryFiltersProps {
  searchVal: string;
  setSearchVal: (val: string) => void;
  isClientsLoading: boolean;
  cityFilter: string;
  setCityFilter: (val: string) => void;
  conditionFilter: string;
  setConditionFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: 'ASC' | 'DESC';
  setSortOrder: (val: 'ASC' | 'DESC') => void;
  cities: string[];
  healthConditions: string[];
}

export default function DirectoryFilters({
  searchVal,
  setSearchVal,
  isClientsLoading,
  cityFilter,
  setCityFilter,
  conditionFilter,
  setConditionFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  cities,
  healthConditions,
}: DirectoryFiltersProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-sky-500" />
          Client Directory
        </h3>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search name, ID, or email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
          />
          {isClientsLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Loader2 className="h-4 w-4 text-sky-500 animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800/40">
        {/* Filter by City */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">City</label>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Condition */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Condition</label>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="">All Conditions</option>
            {healthConditions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="created_at">Date Joined</option>
            <option value="full_name">Client Name</option>
            <option value="client_id">Client ID</option>
            <option value="age">Age</option>
            <option value="city">City</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order</label>
          <button
            onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
            type="button"
            className="w-full bg-slate-900 border border-slate-800 text-white hover:border-slate-700 rounded-xl px-4 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors"
          >
            <span>{sortOrder === 'ASC' ? 'Ascending' : 'Descending'}</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
