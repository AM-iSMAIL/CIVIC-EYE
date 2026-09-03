'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Users,
  ShieldAlert,
  HelpCircle,
  Wrench,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import {
  type CivicIncidentAnalysis,
  type CivicCategory,
  CIVIC_CATEGORIES,
  CATEGORY_LABELS,
  HAZARD_COLORS,
  AFFECTED_USER_LABELS,
} from '@/types/analysis';

interface AiAnalysisCardProps {
  analysis: CivicIncidentAnalysis;
  userCategoryOverride: CivicCategory | null;
  onCategoryOverrideChange: (category: CivicCategory | null) => void;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({
  analysis,
  userCategoryOverride,
  onCategoryOverrideChange,
  onReanalyze,
  isAnalyzing,
}) => {
  const [showOverrideDropdown, setShowOverrideDropdown] = useState(false);
  const [isConfirmedAccurate, setIsConfirmedAccurate] = useState(false);

  const activeCategory = userCategoryOverride || analysis.category;
  const confidencePercent = Math.round(analysis.confidence * 100);

  const getSeverityBarColor = (score: number) => {
    if (score >= 8) return 'bg-rose-500';
    if (score >= 6) return 'bg-orange-500';
    if (score >= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-950 tracking-wide uppercase flex items-center gap-2">
              STEP 3: CivicEye AI Analysis
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Verified
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Multimodal defect classification & hazard assessment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            {confidencePercent}% Confidence
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="text-xs"
          >
            {isAnalyzing ? 'Re-analyzing...' : 'Re-analyze'}
          </Button>
        </div>
      </div>

      {/* Primary Intelligence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Category */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
            Detected Category
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">
              {CATEGORY_LABELS[activeCategory] || activeCategory}
            </span>
            {userCategoryOverride && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Modified
              </span>
            )}
          </div>
        </div>

        {/* Severity */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              Severity Rating
            </span>
            <span className="text-xs font-bold font-mono text-slate-900">
              {analysis.severity} / 10
            </span>
          </div>
          {/* Visual severity meter */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full ${getSeverityBarColor(analysis.severity)}`}
              style={{ width: `${(analysis.severity / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Hazard Level */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
            Hazard Level
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase text-slate-800">
              {analysis.hazardLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Affected User Groups */}
      <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>Affected Citizens & Commuters</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {analysis.affectedUsers && analysis.affectedUsers.length > 0 ? (
            analysis.affectedUsers.map((group) => (
              <span
                key={group}
                className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs font-medium"
              >
                {AFFECTED_USER_LABELS[group] || group}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">None identified</span>
          )}
        </div>
      </div>

      {/* Visible Evidence Description */}
      <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Visible Evidence Description</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {analysis.description}
        </p>
      </div>

      {/* Recommended Municipal Action */}
      <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
          <Wrench className="w-3.5 h-3.5 text-emerald-600" />
          <span>Recommended Civic Response</span>
        </div>
        <p className="text-xs text-emerald-800/90 leading-relaxed font-medium">
          {analysis.recommendedAction}
        </p>
      </div>

      {/* Citizen Verification & Category Override Strip */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Is this classification accurate?</span>
          </div>

          <div className="flex items-center gap-2">
            {!isConfirmedAccurate && !userCategoryOverride ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfirmedAccurate(true)}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  className="text-xs"
                >
                  Yes, looks accurate
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOverrideDropdown(!showOverrideDropdown)}
                  rightIcon={<ChevronDown className="w-3 h-3 text-slate-400" />}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >
                  Change Category
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {userCategoryOverride ? 'Category updated' : 'Confirmed accurate'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmedAccurate(false);
                    setShowOverrideDropdown(true);
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-800 underline ml-1 cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Change Category Dropdown Selector */}
        {showOverrideDropdown && (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              Select Alternate Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CIVIC_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onCategoryOverrideChange(cat === analysis.category ? null : cat);
                    setShowOverrideDropdown(false);
                    setIsConfirmedAccurate(true);
                  }}
                  className={`text-xs px-3 py-2 rounded-xl text-left transition-all border cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
