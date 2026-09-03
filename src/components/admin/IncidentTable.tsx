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
      <div className="p-12 text-center space-y-2 border border-slate-200/80 rounded-2xl bg-white shadow-xs">
        <p className="text-sm font-bold text-slate-900">No Incidents Found</p>
        <p className="text-xs text-slate-500">
          No civic defects match the selected filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-mono tracking-wider text-slate-500">
              <th className="py-3.5 px-4 font-bold">Priority</th>
              <th className="py-3.5 px-4 font-bold">Category</th>
              <th className="py-3.5 px-4 font-bold">Severity</th>
              <th className="py-3.5 px-4 font-bold">Hazard</th>
              <th className="py-3.5 px-4 text-center font-bold">Reports</th>
              <th className="py-3.5 px-4 font-bold">Location</th>
              <th className="py-3.5 px-4 font-bold">Status</th>
              <th className="py-3.5 px-4 font-bold">Reported</th>
              <th className="py-3.5 px-4 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {incidents.map((row) => {
              const priLevel = row.priority?.level || 'medium';
              const priScore = row.priority?.score ?? row.severity * 10;
              const hazardStyle = HAZARD_COLORS[row.hazardLevel] || HAZARD_COLORS.medium;

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectIncident(row)}
                  className="hover:bg-slate-50/75 transition-colors cursor-pointer group"
                >
                  {/* Priority */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {priScore}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          priLevel === 'critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : priLevel === 'high'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : priLevel === 'medium'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {priLevel}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {CATEGORY_LABELS[row.category] || row.category}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                      {row.description}
                    </span>
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.severity >= 8
                              ? 'bg-rose-500'
                              : row.severity >= 6
                              ? 'bg-orange-500'
                              : row.severity >= 4
                              ? 'bg-blue-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(row.severity / 10) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-600 font-medium">{row.severity}/10</span>
                    </div>
                  </td>

                  {/* Hazard */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${hazardStyle.bg} ${hazardStyle.text} ${hazardStyle.border}`}
                    >
                      {row.hazardLevel}
                    </span>
                  </td>

                  {/* Reports */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1 font-mono">
                      <span className="font-bold text-slate-900">{row.reportCount}</span>
                      {row.reportCount > 1 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>
                        {row.latitude.toFixed(4)}°, {row.longitude.toFixed(4)}°
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge type="status" value={row.status} size="sm" />
                  </td>

                  {/* Reported Time */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{new Date(row.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(row);
                      }}
                      className="text-slate-400 hover:text-blue-600 p-1.5 h-auto"
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
