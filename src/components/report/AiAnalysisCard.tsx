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
  const hazardStyle = HAZARD_COLORS[analysis.hazardLevel] || HAZARD_COLORS.medium;

  const getSeverityColor = (score: number) => {
    if (score >= 8) return 'bg-rose-500 text-rose-300';
    if (score >= 6) return 'bg-orange-500 text-orange-300';
    if (score >= 4) return 'bg-amber-500 text-amber-300';
    return 'bg-emerald-500 text-emerald-300';
  };

  return (
    <div className="bg-slate-900/90 border border-emerald-800/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/80 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              STEP 3: CivicEye AI Analysis
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Verified
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Multimodal defect classification & hazard assessment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300">
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
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
            Detected Category
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              {CATEGORY_LABELS[activeCategory] || activeCategory}
            </span>
            {userCategoryOverride && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                User Modified
              </span>
            )}
          </div>
        </div>

        {/* Severity */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">
              Severity Rating
            </span>
            <span className="text-xs font-bold font-mono text-white">
              {analysis.severity} / 10
            </span>
          </div>
          {/* Visual severity meter */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1.5">
            <div
              className={`h-full rounded-full ${getSeverityColor(analysis.severity).split(' ')[0]}`}
              style={{ width: `${(analysis.severity / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Hazard Level */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
            Hazard Level
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span
              className={`text-xs font-semibold uppercase px-2 py-0.5 rounded border ${hazardStyle.bg} ${hazardStyle.text} ${hazardStyle.border}`}
            >
              {analysis.hazardLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Affected User Groups */}
      <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/70 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>Affected Citizens & Commuters</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {analysis.affectedUsers && analysis.affectedUsers.length > 0 ? (
            analysis.affectedUsers.map((group) => (
              <span
                key={group}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-200"
              >
                {AFFECTED_USER_LABELS[group] || group}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">None identified</span>
          )}
        </div>
      </div>

      {/* Visible Evidence Description */}
      <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/70 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Visible Evidence Description</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {analysis.description}
        </p>
      </div>

      {/* Recommended Municipal Action */}
      <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recommended Civic Response</span>
        </div>
        <p className="text-xs text-emerald-200/90 leading-relaxed">
          {analysis.recommendedAction}
        </p>
      </div>

      {/* Citizen Verification & Category Override Strip */}
      <div className="pt-2 border-t border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
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
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Change Category
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {userCategoryOverride ? 'Category updated' : 'Confirmed accurate'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmedAccurate(false);
                    setShowOverrideDropdown(true);
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline ml-1"
                >
                  Change
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Change Category Dropdown Selector */}
        {showOverrideDropdown && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Alternate Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {CIVIC_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onCategoryOverrideChange(cat === analysis.category ? null : cat);
                    setShowOverrideDropdown(false);
                    setIsConfirmedAccurate(true);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg text-left transition-all border ${
                    activeCategory === cat
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
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
