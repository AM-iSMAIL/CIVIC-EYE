'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Wrench,
  FileText,
  Layers,
  UserCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatusActions } from './StatusActions';
import { getAdminIncidentDetails } from '@/services/admin';
import type { AdminIncidentRow } from '@/types/admin';
import type { IncidentDocument, IssueStatus } from '@/types/incident';
import { CATEGORY_LABELS, HAZARD_COLORS } from '@/types/analysis';

interface IncidentDetailModalProps {
  incident: AdminIncidentRow;
  onClose: () => void;
  onStatusUpdated?: (newStatus: IssueStatus) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onStatusUpdated,
}) => {
  const [details, setDetails] = useState<IncidentDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getAdminIncidentDetails(incident.id).then((res) => {
      if (isMounted) {
        setDetails(res.incident);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [incident.id]);

  const hazardStyle = HAZARD_COLORS[incident.hazardLevel] || HAZARD_COLORS.medium;
  const priLevel = incident.priority?.level || 'medium';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <Card className="max-w-3xl w-full bg-slate-900 border-slate-700/80 shadow-2xl rounded-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/40">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg sm:text-xl font-bold text-white tracking-wide">
                {CATEGORY_LABELS[incident.category] || incident.category}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${hazardStyle.bg} ${hazardStyle.text} ${hazardStyle.border}`}
              >
                {incident.hazardLevel} Hazard
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                  priLevel === 'critical'
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                    : priLevel === 'high'
                    ? 'bg-orange-950/60 text-orange-300 border-orange-800'
                    : priLevel === 'medium'
                    ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                }`}
              >
                Priority {incident.priority?.score ?? 50} • {priLevel}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>ID: {incident.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {new Date(incident.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-auto text-slate-400 hover:text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status & Priority Overview Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Status
              </span>
              <div>
                <StatusBadge type="status" value={incident.status} size="md" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Physical Severity
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white font-mono">
                  {incident.severity} / 10
                </span>
                <span className="text-xs text-slate-400">
                  ({incident.severity >= 8 ? 'Extreme' : incident.severity >= 6 ? 'Major' : 'Moderate'})
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Citizen Reports
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {incident.reportCount}
                </span>
                {incident.reportCount > 1 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Consensus Confirmed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Assessment & Description */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                AI Visual Defect Analysis
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                {incident.description || 'No defect description provided.'}
              </p>
            </div>

            {incident.recommendedAction && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  Recommended Municipal Action
                </span>
                <p className="text-xs sm:text-sm text-emerald-200 leading-relaxed p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                  {incident.recommendedAction}
                </p>
              </div>
            )}
          </div>

          {/* GPS Coordinates & Geohash */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Authoritative Geospatial Telemetry
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">LATITUDE</span>
                <span>{incident.latitude.toFixed(6)}° N</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">LONGITUDE</span>
                <span>{incident.longitude.toFixed(6)}° E</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">GPS ACCURACY</span>
                <span>±{incident.accuracy || 10} meters</span>
              </div>
            </div>
          </div>

          {/* Phase 7 Priority & Duplicate Intelligence Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Factors */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Deterministic Priority Factors
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Severity Factor (30%):</span>
                  <span className="font-mono text-white">{incident.severity * 10} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hazard Factor (25%):</span>
                  <span className="font-mono text-white capitalize">{incident.hazardLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Report Consensus (20%):</span>
                  <span className="font-mono text-white">{incident.reportCount} reports</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                  <span className="text-slate-300">Consolidated Score:</span>
                  <span className="text-emerald-400 font-mono">
                    {incident.priority?.score ?? 50} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* Duplicate Intelligence */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Cluster & Duplicate Audit
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cluster Assignment:</span>
                  <span className="font-mono text-white truncate max-w-[140px]">
                    {incident.clusterId || `cluster_${incident.id}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Canonical Defect:</span>
                  <span className="font-mono text-emerald-400">
                    {incident.isCluster ? 'Cluster Anchor' : 'Original Report'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duplicate Count:</span>
                  <span className="font-mono text-white">
                    {Math.max(0, incident.reportCount - 1)} duplicates
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin-Only Citizen Reporter Information */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-700 space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Citizen Reporter Attribution (Admin Clearance Only)
            </span>

            {loading ? (
              <div className="text-xs text-slate-400">Loading reporter credentials...</div>
            ) : details?.reporter ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">NAME</span>
                  <span className="text-white font-semibold">
                    {details.reporter.displayName || 'Anonymous Citizen'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">EMAIL</span>
                  <span className="truncate block">{details.reporter.email || 'None registered'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">USER UID</span>
                  <span className="truncate block text-slate-400">{details.reporter.uid}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-mono">
                Reporter identity securely decoupled. Document UID: {incident.id}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Status Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-400">
            Current Status: <span className="font-bold text-white uppercase">{incident.status}</span>
          </div>

          <div className="flex items-center gap-2">
            <StatusActions
              incidentId={incident.id}
              currentStatus={incident.status}
              clusterId={incident.clusterId}
              onStatusUpdated={(newStatus) => {
                if (onStatusUpdated) onStatusUpdated(newStatus);
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
