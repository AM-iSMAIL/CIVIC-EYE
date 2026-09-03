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
    { id: 'pothole', label: 'Potholes', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'garbage', label: 'Garbage', icon: <Trash2 className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'blocked_drain', label: 'Blocked Drains', icon: <Droplets className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'broken_streetlight', label: 'Streetlights', icon: <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> },
    { id: 'fallen_tree', label: 'Fallen Trees', icon: <Trees className="w-3.5 h-3.5 text-lime-400" /> },
    { id: 'damaged_sidewalk', label: 'Sidewalks', icon: <Footprints className="w-3.5 h-3.5 text-indigo-400" /> },
    { id: 'damaged_road_sign', label: 'Road Signs', icon: <Signpost className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'exposed_wire', label: 'Exposed Wires', icon: <Zap className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'other', label: 'Other', icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> },
  ];

  const severities: Array<{ id: MapSeverityFilter; label: string; color: string }> = [
    { id: 'all', label: 'All Severities', color: 'border-slate-700 text-slate-300' },
    { id: 'low', label: 'Low (1–3)', color: 'border-emerald-700/60 text-emerald-300 bg-emerald-950/40' },
    { id: 'medium', label: 'Medium (4–6)', color: 'border-cyan-700/60 text-cyan-300 bg-cyan-950/40' },
    { id: 'high', label: 'High (7–8)', color: 'border-orange-700/60 text-orange-300 bg-orange-950/40' },
    { id: 'critical', label: 'Critical (9–10)', color: 'border-rose-700/60 text-rose-300 bg-rose-950/40' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 shadow-lg backdrop-blur-sm">
      {/* Top Header: Filter title & Count Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interactive Map Filters</span>
        </div>

        {/* Live incident count */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">{filteredCount}</span>
          <span className="text-slate-400">
            {filteredCount === 1 ? 'incident' : 'incidents'}
            {filteredCount !== totalCount && ` (of ${totalCount})`}
          </span>
        </div>
      </div>

      {/* Category Filter Pills (Horizontal scrolling on small screens) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/70'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Severity Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-800/80 text-xs">
        <span className="text-[11px] text-slate-400 uppercase font-semibold mr-1 shrink-0 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-slate-500" />
          Severity:
        </span>
        {severities.map((sev) => {
          const isSelected = selectedSeverity === sev.id;
          return (
            <button
              key={sev.id}
              type="button"
              onClick={() => onSeverityChange(sev.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-slate-100 text-slate-900 border-white font-bold shadow-xs'
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
