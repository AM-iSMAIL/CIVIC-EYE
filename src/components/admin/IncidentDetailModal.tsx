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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <Card className="max-w-3xl w-full bg-white border border-slate-200 shadow-2xl rounded-3xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-white">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                {CATEGORY_LABELS[incident.category] || incident.category}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${hazardStyle.bg} ${hazardStyle.text} ${hazardStyle.border}`}
              >
                {incident.hazardLevel} Hazard
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  priLevel === 'critical'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : priLevel === 'high'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : priLevel === 'medium'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                Priority {incident.priority?.score ?? 50} • {priLevel}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>ID: {incident.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(incident.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-auto text-slate-400 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status & Priority Overview Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Status
              </span>
              <div>
                <StatusBadge type="status" value={incident.status} size="md" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Physical Severity
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-950 font-mono">
                  {incident.severity} / 10
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  ({incident.severity >= 8 ? 'Extreme' : incident.severity >= 6 ? 'Major' : 'Moderate'})
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Citizen Reports
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-950 font-mono">
                  {incident.reportCount}
                </span>
                {incident.reportCount > 1 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Consensus Confirmed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* AI Assessment & Description */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                AI Visual Defect Analysis
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                {incident.description || 'No defect description provided.'}
              </p>
            </div>

            {incident.recommendedAction && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  Recommended Municipal Action
                </span>
                <p className="text-xs sm:text-sm text-blue-950 leading-relaxed p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 font-medium">
                  {incident.recommendedAction}
                </p>
              </div>
            )}
          </div>

          {/* GPS Coordinates & Geohash */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Authoritative Geospatial Telemetry
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] font-sans font-medium">LATITUDE</span>
                <span className="font-bold">{incident.latitude.toFixed(6)}° N</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans font-medium">LONGITUDE</span>
                <span className="font-bold">{incident.longitude.toFixed(6)}° E</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-sans font-medium">GPS ACCURACY</span>
                <span className="font-bold">±{incident.accuracy || 10} meters</span>
              </div>
            </div>
          </div>

          {/* Priority & Duplicate Intelligence Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Factors */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Deterministic Priority Factors
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Severity Factor (30%):</span>
                  <span className="font-mono text-slate-900 font-bold">{incident.severity * 10} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hazard Factor (25%):</span>
                  <span className="font-mono text-slate-900 font-bold capitalize">{incident.hazardLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Report Consensus (20%):</span>
                  <span className="font-mono text-slate-900 font-bold">{incident.reportCount} reports</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold">
                  <span className="text-slate-700">Consolidated Score:</span>
                  <span className="text-blue-600 font-mono">
                    {incident.priority?.score ?? 50} / 100
                  </span>
                </div>
              </div>
            </div>

            {/* Duplicate Intelligence */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Cluster & Duplicate Audit
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cluster Assignment:</span>
                  <span className="font-mono text-slate-900 font-bold truncate max-w-[140px]">
                    {incident.clusterId || `cluster_${incident.id}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Canonical Defect:</span>
                  <span className="font-mono text-blue-600 font-bold">
                    {incident.isCluster ? 'Cluster Anchor' : 'Original Report'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duplicate Count:</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {Math.max(0, incident.reportCount - 1)} duplicates
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin-Only Citizen Reporter Information */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Citizen Reporter Attribution (Admin Clearance Only)
            </span>

            {loading ? (
              <div className="text-xs text-slate-400">Loading reporter credentials...</div>
            ) : details?.reporter ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">NAME</span>
                  <span className="text-slate-900 font-bold">
                    {details.reporter.displayName || 'Anonymous Citizen'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">EMAIL</span>
                  <span className="truncate block font-medium">{details.reporter.email || 'None registered'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">USER UID</span>
                  <span className="truncate block text-slate-500">{details.reporter.uid}</span>
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
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-500">
            Current Status: <span className="font-bold text-slate-900 uppercase">{incident.status}</span>
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
