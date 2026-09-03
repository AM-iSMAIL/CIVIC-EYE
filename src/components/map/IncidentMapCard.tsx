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
    <Card className="border-emerald-800/60 bg-slate-900/95 shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header Strip: Category & Close */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                {CATEGORY_LABELS[incident.category] || incident.category}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${hazardStyle.bg} ${hazardStyle.text} ${hazardStyle.border}`}
              >
                {incident.hazardLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 h-auto"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Phase 7: Cluster Report Consensus Banner */}
        {incident.reportCount && incident.reportCount > 1 && (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-300">
                {incident.reportCount} Citizen Reports
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">
              Consensus Confirmed
            </span>
          </div>
        )}

        {/* Severity, Priority & Status Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Priority or Severity Meter */}
          {incident.priority ? (
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Priority Score</span>
                <span className="font-mono font-bold text-white">
                  {incident.priority.score} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    incident.priority.level === 'critical'
                      ? 'bg-rose-500'
                      : incident.priority.level === 'high'
                      ? 'bg-orange-500'
                      : incident.priority.level === 'medium'
                      ? 'bg-cyan-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${incident.priority.score}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-500">Tier</span>
                <span
                  className={`text-[9px] font-bold uppercase ${
                    incident.priority.level === 'critical'
                      ? 'text-rose-400'
                      : incident.priority.level === 'high'
                      ? 'text-orange-400'
                      : incident.priority.level === 'medium'
                      ? 'text-cyan-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {incident.priority.level}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Severity Score</span>
                <span className="font-mono font-bold text-white">
                  {incident.severity} / 10
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    incident.severity >= 9
                      ? 'bg-rose-500'
                      : incident.severity >= 7
                      ? 'bg-orange-500'
                      : incident.severity >= 4
                      ? 'bg-cyan-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(incident.severity / 10) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              Dispatch Status
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300 capitalize">
                {incident.status}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {incident.description && (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-slate-500" />
              AI Visual Assessment
            </span>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/70">
              {incident.description}
            </p>
          </div>
        )}

        {/* Recommended Action */}
        {incident.recommendedAction && (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3 h-3 text-emerald-400" />
              Recommended Municipal Action
            </span>
            <p className="text-xs text-emerald-200/90 leading-relaxed bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/40">
              {incident.recommendedAction}
            </p>
          </div>
        )}

        {/* Affected User Groups */}
        {incident.affectedUsers && incident.affectedUsers.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3 h-3 text-slate-500" />
              Affected Commuters
            </span>
            <div className="flex flex-wrap gap-1.5">
              {incident.affectedUsers.map((group) => (
                <span
                  key={group}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 capitalize"
                >
                  {group.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* GPS Coordinates Readout */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
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
