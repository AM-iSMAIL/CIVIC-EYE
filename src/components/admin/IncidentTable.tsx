'use client';

import React from 'react';
import { Eye, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { AdminIncidentRow } from '@/types/admin';
import { CATEGORY_LABELS, HAZARD_COLORS } from '@/types/analysis';

interface IncidentTableProps {
  incidents: AdminIncidentRow[];
  onSelectIncident: (incident: AdminIncidentRow) => void;
  loading?: boolean;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  onSelectIncident,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 font-mono">
        Loading real-time incidents from Firestore dispatch...
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="p-12 text-center space-y-2 border border-slate-800 rounded-xl bg-slate-900/60">
        <p className="text-sm font-semibold text-slate-300">No Incidents Found</p>
        <p className="text-xs text-slate-500">
          No civic defects match the selected filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] uppercase font-mono tracking-wider text-slate-400">
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Hazard</th>
              <th className="py-3 px-4 text-center">Reports</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Reported</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {incidents.map((row) => {
              const priLevel = row.priority?.level || 'medium';
              const priScore = row.priority?.score ?? row.severity * 10;
              const hazardStyle = HAZARD_COLORS[row.hazardLevel] || HAZARD_COLORS.medium;

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectIncident(row)}
                  className="hover:bg-slate-850/60 transition-colors cursor-pointer group"
                >
                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">
                        {priScore}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          priLevel === 'critical'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                            : priLevel === 'high'
                            ? 'bg-orange-950/60 text-orange-300 border-orange-800'
                            : priLevel === 'medium'
                            ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {priLevel}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {CATEGORY_LABELS[row.category] || row.category}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                      {row.description}
                    </span>
                  </td>

                  {/* Severity */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.severity >= 8
                              ? 'bg-rose-500'
                              : row.severity >= 6
                              ? 'bg-orange-500'
                              : row.severity >= 4
                              ? 'bg-cyan-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(row.severity / 10) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-300">{row.severity}/10</span>
                    </div>
                  </td>

                  {/* Hazard */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${hazardStyle.bg} ${hazardStyle.text} ${hazardStyle.border}`}
                    >
                      {row.hazardLevel}
                    </span>
                  </td>

                  {/* Reports */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1 font-mono">
                      <span className="font-bold text-white">{row.reportCount}</span>
                      {row.reportCount > 1 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>
                        {row.latitude.toFixed(4)}°, {row.longitude.toFixed(4)}°
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge type="status" value={row.status} size="sm" />
                  </td>

                  {/* Reported Time */}
                  <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{new Date(row.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(row);
                      }}
                      className="text-slate-400 hover:text-emerald-400 p-1.5 h-auto"
                      aria-label="Inspect incident"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
