'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  PlusCircle,
  MapPin,
  Hash,
} from 'lucide-react';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  type CivicCategory,
  type HazardLevel,
  CATEGORY_LABELS,
  HAZARD_COLORS,
} from '@/types/analysis';
import type { GPSLocation } from '@/types/report';

interface ReportSuccessCardProps {
  incidentId: string;
  category: CivicCategory;
  severity: number;
  hazardLevel: HazardLevel;
  location: GPSLocation;
  onResetForm: () => void;
}

export const ReportSuccessCard: React.FC<ReportSuccessCardProps> = ({
  incidentId,
  category,
  severity,
  hazardLevel,
  location,
  onResetForm,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(incidentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hazardStyle = HAZARD_COLORS[hazardLevel] || HAZARD_COLORS.medium;

  return (
    <Card className="border-emerald-700/60 bg-slate-900/95 shadow-2xl p-6 sm:p-8 text-center space-y-6 max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
      <CardContent className="space-y-6 p-0">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500/60 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Report Submitted Successfully
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Your civic issue has been permanently registered in Cloud Firestore and queued for municipal dispatch.
          </p>
        </div>

        {/* Incident Tracking ID Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5">
            <Hash className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                Firestore Incident ID
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-white break-all">
                {incidentId}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            leftIcon={
              copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )
            }
            className="shrink-0 text-xs"
          >
            {copied ? 'Copied' : 'Copy ID'}
          </Button>
        </div>

        {/* Summary Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Category
            </span>
            <span className="text-xs font-semibold text-white block truncate">
              {CATEGORY_LABELS[category] || category}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Severity
            </span>
            <span className="text-xs font-bold font-mono text-white block">
              {severity} / 10
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Hazard
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border inline-block ${hazardStyle.bg} ${hazardStyle.text} ${hazardStyle.border}`}
            >
              {hazardLevel}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              GPS Accuracy
            </span>
            <div className="flex items-center gap-1 text-emerald-300">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-xs font-mono">±{location.accuracy}m</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Status: <strong className="text-emerald-400">reported</strong></span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] text-slate-400">Zero image data stored in cloud</span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onResetForm}
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-md shadow-emerald-950/40"
          >
            Report Another Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
