'use client';

import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Users,
  Wrench,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  CATEGORY_LABELS,
  HAZARD_COLORS,
} from '@/types/analysis';
import type { PublicIncidentDocument } from '@/types/incident';

interface IncidentMapCardProps {
  incident: PublicIncidentDocument;
  onClose: () => void;
}

export const IncidentMapCard: React.FC<IncidentMapCardProps> = ({
  incident,
  onClose,
}) => {
  const hazardStyle = HAZARD_COLORS[incident.hazardLevel] || HAZARD_COLORS.medium;

  // Format creation timestamp
  let formattedDate = 'Recently reported';
  if (incident.createdAt) {
    try {
      if (typeof incident.createdAt === 'object' && 'toDate' in incident.createdAt) {
        formattedDate = (incident.createdAt as { toDate: () => Date })
          .toDate()
          .toLocaleString();
      } else if (typeof incident.createdAt === 'string') {
        formattedDate = new Date(incident.createdAt).toLocaleString();
      }
    } catch {
      formattedDate = 'Recently reported';
    }
  }

  return (
    <Card className="border border-slate-200/80 bg-white shadow-xl overflow-hidden rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header Strip: Category & Close */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-950 tracking-wide">
                {CATEGORY_LABELS[incident.category] || incident.category}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${hazardStyle.bg} ${hazardStyle.text} ${hazardStyle.border}`}
              >
                {incident.hazardLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 h-auto"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Cluster Report Consensus Banner */}
        {incident.reportCount && incident.reportCount > 1 && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-bold text-emerald-900">
                {incident.reportCount} Citizen Reports
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold">
              Consensus Confirmed
            </span>
          </div>
        )}

        {/* Severity, Priority & Status Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Priority or Severity Meter */}
          {incident.priority ? (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Priority Score</span>
                <span className="font-mono font-bold text-slate-900">
                  {incident.priority.score} / 100
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    incident.priority.level === 'critical'
                      ? 'bg-rose-500'
                      : incident.priority.level === 'high'
                      ? 'bg-orange-500'
                      : incident.priority.level === 'medium'
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${incident.priority.score}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Tier</span>
                <span
                  className={`text-[9px] font-bold uppercase ${
                    incident.priority.level === 'critical'
                      ? 'text-rose-600'
                      : incident.priority.level === 'high'
                      ? 'text-orange-600'
                      : incident.priority.level === 'medium'
                      ? 'text-blue-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {incident.priority.level}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Severity Score</span>
                <span className="font-mono font-bold text-slate-900">
                  {incident.severity} / 10
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    incident.severity >= 9
                      ? 'bg-rose-500'
                      : incident.severity >= 7
                      ? 'bg-orange-500'
                      : incident.severity >= 4
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(incident.severity / 10) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              Dispatch Status
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 capitalize">
                {incident.status}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {incident.description && (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-medium">
              <FileText className="w-3 h-3 text-slate-400" />
              AI Visual Assessment
            </span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              {incident.description}
            </p>
          </div>
        )}

        {/* Recommended Action */}
        {incident.recommendedAction && (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-medium">
              <Wrench className="w-3 h-3 text-blue-600" />
              Recommended Municipal Action
            </span>
            <p className="text-xs text-blue-900 leading-relaxed bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 font-medium">
              {incident.recommendedAction}
            </p>
          </div>
        )}

        {/* Affected User Groups */}
        {incident.affectedUsers && incident.affectedUsers.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-medium">
              <Users className="w-3 h-3 text-slate-400" />
              Affected Commuters
            </span>
            <div className="flex flex-wrap gap-1.5">
              {incident.affectedUsers.map((group) => (
                <span
                  key={group}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize font-medium"
                >
                  {group.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* GPS Coordinates Readout */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {incident.latitude.toFixed(5)}°, {incident.longitude.toFixed(5)}°
            </span>
          </div>
          <span>±{incident.accuracy}m</span>
        </div>
      </CardContent>
    </Card>
  );
};
