'use client';

import React from 'react';
import {
  Layers,
  Filter,
  AlertTriangle,
  Trash2,
  Droplets,
  Lightbulb,
  Trees,
  Footprints,
  Signpost,
  Zap,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import type { MapCategoryFilter, MapSeverityFilter } from '@/types/map';

interface MapFiltersProps {
  selectedCategory: MapCategoryFilter;
  selectedSeverity: MapSeverityFilter;
  onCategoryChange: (cat: MapCategoryFilter) => void;
  onSeverityChange: (sev: MapSeverityFilter) => void;
  totalCount: number;
  filteredCount: number;
}

export const MapFilters: React.FC<MapFiltersProps> = ({
  selectedCategory,
  selectedSeverity,
  onCategoryChange,
  onSeverityChange,
  totalCount,
  filteredCount,
}) => {
  const categories: Array<{ id: MapCategoryFilter; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'All Issues', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'pothole', label: 'Potholes', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'garbage', label: 'Garbage', icon: <Trash2 className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'blocked_drain', label: 'Blocked Drains', icon: <Droplets className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'broken_streetlight', label: 'Streetlights', icon: <Lightbulb className="w-3.5 h-3.5 text-yellow-500" /> },
    { id: 'fallen_tree', label: 'Fallen Trees', icon: <Trees className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'damaged_sidewalk', label: 'Sidewalks', icon: <Footprints className="w-3.5 h-3.5 text-indigo-500" /> },
    { id: 'damaged_road_sign', label: 'Road Signs', icon: <Signpost className="w-3.5 h-3.5 text-blue-600" /> },
    { id: 'exposed_wire', label: 'Exposed Wires', icon: <Zap className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'other', label: 'Other', icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> },
  ];

  const severities: Array<{ id: MapSeverityFilter; label: string; color: string }> = [
    { id: 'all', label: 'All Severities', color: 'border-slate-200 text-slate-700 bg-white' },
    { id: 'low', label: 'Low (1–3)', color: 'border-emerald-200 text-emerald-700 bg-emerald-50' },
    { id: 'medium', label: 'Medium (4–6)', color: 'border-blue-200 text-blue-700 bg-blue-50' },
    { id: 'high', label: 'High (7–8)', color: 'border-orange-200 text-orange-700 bg-orange-50' },
    { id: 'critical', label: 'Critical (9–10)', color: 'border-rose-200 text-rose-700 bg-rose-50' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 space-y-3 shadow-sm">
      {/* Top Header: Filter title & Count Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Interactive Map Filters</span>
        </div>

        {/* Live incident count */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-900">{filteredCount}</span>
          <span className="text-slate-500">
            {filteredCount === 1 ? 'incident' : 'incidents'}
            {filteredCount !== totalCount && ` (of ${totalCount})`}
          </span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Severity Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
        <span className="text-[11px] text-slate-500 uppercase font-semibold mr-1 shrink-0 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-slate-400" />
          Severity:
        </span>
        {severities.map((sev) => {
          const isSelected = selectedSeverity === sev.id;
          return (
            <button
              key={sev.id}
              type="button"
              onClick={() => onSeverityChange(sev.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                  : sev.color
              }`}
            >
              {sev.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
