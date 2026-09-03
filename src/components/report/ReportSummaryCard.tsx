'use client';

import React from 'react';
import {
  Send,
  CheckCircle2,
  MapPin,
  ShieldAlert,
  Loader2,
  AlertCircle,
  FileCheck2,
  Edit3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  type CivicIncidentAnalysis,
  type CivicCategory,
  CATEGORY_LABELS,
  HAZARD_COLORS,
} from '@/types/analysis';
import type { GPSLocation } from '@/types/report';

interface ReportSummaryCardProps {
  analysis: CivicIncidentAnalysis;
  userCategoryOverride: CivicCategory | null;
  location: GPSLocation;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
}

export const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({
  analysis,
  userCategoryOverride,
  location,
  isSubmitting,
  submitError,
  onSubmit,
}) => {
  const finalCategory = userCategoryOverride || analysis.category;
  const isOverridden = Boolean(userCategoryOverride && userCategoryOverride !== analysis.category);

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm space-y-2">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-950 uppercase tracking-wide flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            STEP 4: Review & Submit Civic Report
          </CardTitle>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
            Ready to Dispatch
          </span>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Verify your civic incident summary before persisting to the municipal ledger.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-3">
        {/* Concise Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Issue Category */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Issue Category
            </span>
            <div className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900 truncate">
                {CATEGORY_LABELS[finalCategory] || finalCategory}
              </span>
            </div>
            {isOverridden && (
              <span className="text-[9px] text-blue-600 block font-mono">
                User corrected
              </span>
            )}
          </div>

          {/* Severity */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Severity
            </span>
            <span className="text-xs font-bold font-mono text-slate-900 block">
              {analysis.severity} / 10
            </span>
            <span className="text-[9px] text-slate-400 block font-medium">
              Visible risk rating
            </span>
          </div>

          {/* Hazard Level */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Hazard Level
            </span>
            <div className="flex items-center gap-1 pt-0.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase text-slate-800">
                {analysis.hazardLevel}
              </span>
            </div>
          </div>

          {/* GPS Location */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              GPS Location
            </span>
            <div className="flex items-center gap-1 text-emerald-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold truncate">
                Captured (±{location.accuracy}m)
              </span>
            </div>
            <span className="text-[9px] text-slate-500 block font-mono">
              {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
            </span>
          </div>
        </div>

        {/* AI Confirmation Status Strip */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            {isOverridden ? (
              <Edit3 className="w-4 h-4 text-blue-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span className="text-slate-700">
              AI Analysis Status:{' '}
              <strong className={isOverridden ? 'text-blue-700' : 'text-emerald-700'}>
                {isOverridden ? 'User corrected category' : 'Confirmed accurate'}
              </strong>
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Status: reported
          </span>
        </div>

        {/* Submission Error Banner */}
        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Submission Action Button */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
          leftIcon={
            isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )
          }
          className="w-full font-semibold shadow-sm hover:shadow"
        >
          {isSubmitting ? 'Submitting civic report...' : 'Submit Civic Report'}
        </Button>

        <p className="text-[11px] text-slate-400 text-center">
          Submitting creates a persistent incident record in Firestore. Incident metadata is linked to your verified citizen ID.
        </p>
      </CardContent>
    </Card>
  );
};
