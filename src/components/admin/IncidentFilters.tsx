'use client';

import React from 'react';
import { Search, ArrowUpDown, RotateCcw } from 'lucide-react';
import type {
  AdminIncidentFilters,
  CategoryFilter,
  PriorityFilter,
  StatusFilter,
  SortField,
} from '@/types/admin';
import type { HazardLevel } from '@/types/analysis';

interface IncidentFiltersProps {
  filters: AdminIncidentFilters;
  onChange: (updated: Partial<AdminIncidentFilters>) => void;
  onReset: () => void;
  totalCount: number;
}

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalCount,
}) => {
  return (
    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
      {/* Top Search & Reset Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Search defects, category, ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-slate-400 font-mono">
            Showing <span className="font-bold text-white">{totalCount}</span> incidents
          </span>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
        {/* Category */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value as CategoryFilter })}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            <option value="pothole">Potholes</option>
            <option value="garbage">Garbage Piles</option>
            <option value="blocked_drain">Blocked Drains</option>
            <option value="broken_streetlight">Streetlights</option>
            <option value="fallen_tree">Fallen Trees</option>
            <option value="damaged_sidewalk">Sidewalks</option>
            <option value="damaged_road_sign">Road Signs</option>
            <option value="water_leak">Water Leaks</option>
            <option value="exposed_wire">Exposed Wiring</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Priority Tier
          </label>
          <select
            value={filters.priority}
            onChange={(e) => onChange({ priority: e.target.value as PriorityFilter })}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical (75–100)</option>
            <option value="high">High (50–74)</option>
            <option value="medium">Medium (25–49)</option>
            <option value="low">Low (0–24)</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as StatusFilter })}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Hazard */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Hazard Level
          </label>
          <select
            value={filters.hazard}
            onChange={(e) => onChange({ hazard: e.target.value as 'all' | HazardLevel })}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Hazards</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Sort Field
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as SortField })}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="priority">Priority Score</option>
            <option value="severity">Physical Severity</option>
            <option value="reports">Report Count</option>
            <option value="createdAt">Date Reported</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Order
          </label>
          <button
            type="button"
            onClick={() => onChange({ sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' })}
            className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between"
          >
            <span>{filters.sortOrder === 'desc' ? 'Descending' : 'Ascending'}</span>
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
