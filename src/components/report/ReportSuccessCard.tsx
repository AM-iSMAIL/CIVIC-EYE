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

  return (
    <Card className="border border-slate-200/80 bg-white shadow-lg p-6 sm:p-8 text-center space-y-6 max-w-2xl mx-auto rounded-3xl animate-in fade-in zoom-in-95 duration-200">
      <CardContent className="space-y-6 p-0">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
            Report Submitted Successfully
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your civic issue has been registered in the municipal ledger and queued for verification and dispatch.
          </p>
        </div>

        {/* Incident Tracking ID Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5">
            <Hash className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Incident Reference ID
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 break-all">
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
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              )
            }
            className="shrink-0 text-xs"
          >
            {copied ? 'Copied' : 'Copy ID'}
          </Button>
        </div>

        {/* Summary Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Category
            </span>
            <span className="text-xs font-bold text-slate-900 block truncate">
              {CATEGORY_LABELS[category] || category}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Severity
            </span>
            <span className="text-xs font-bold font-mono text-slate-900 block">
              {severity} / 10
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Hazard
            </span>
            <span className="text-[11px] font-bold uppercase text-slate-800 block">
              {hazardLevel}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              GPS Accuracy
            </span>
            <div className="flex items-center gap-1 text-emerald-700">
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="text-xs font-mono font-medium">±{location.accuracy}m</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Status: <strong className="text-emerald-700">reported</strong></span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] text-slate-500">Queued for Municipal Dispatch</span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onResetForm}
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Report Another Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
