'use client';

import React from 'react';
import { MapPin, Camera, Sparkles, Send, Check } from 'lucide-react';

interface ReportProgressProps {
  hasLocation: boolean;
  hasPhoto: boolean;
  hasAnalysis?: boolean;
  hasSubmitted?: boolean;
}

export const ReportProgress: React.FC<ReportProgressProps> = ({
  hasLocation,
  hasPhoto,
  hasAnalysis = false,
  hasSubmitted = false,
}) => {
  const steps = [
    {
      id: 1,
      label: 'Location',
      icon: <MapPin className="w-4 h-4" />,
      status: hasLocation ? 'complete' : 'active',
      desc: hasLocation ? 'GPS Acquired' : 'GPS Required',
    },
    {
      id: 2,
      label: 'Evidence',
      icon: <Camera className="w-4 h-4" />,
      status: hasPhoto ? 'complete' : hasLocation ? 'active' : 'pending',
      desc: hasPhoto ? 'Photo Attached' : 'Capture Photo',
    },
    {
      id: 3,
      label: 'AI Analysis',
      icon: <Sparkles className="w-4 h-4" />,
      status: hasAnalysis ? 'complete' : hasPhoto ? 'active' : 'pending',
      desc: hasAnalysis ? 'Triage Complete' : 'Gemini Vision',
    },
    {
      id: 4,
      label: 'Submit',
      icon: <Send className="w-4 h-4" />,
      status: hasSubmitted ? 'complete' : hasAnalysis ? 'active' : 'upcoming',
      desc: hasSubmitted ? 'Report Saved' : hasAnalysis ? 'Ready to Submit' : 'Requires AI',
    },
  ];

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 mb-6 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {steps.map((s) => {
          const isComplete = s.status === 'complete';
          const isActive = s.status === 'active';
          const isUpcoming = s.status === 'upcoming';

          return (
            <div
              key={s.id}
              className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                isComplete
                  ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-800'
                  : isActive
                  ? 'bg-blue-50 border border-blue-200 text-blue-900'
                  : isUpcoming
                  ? 'bg-slate-50/50 border border-slate-100 text-slate-400 opacity-60'
                  : 'bg-slate-50 border border-slate-200/70 text-slate-600'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isComplete
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-400'
                }`}
              >
                {isComplete ? <Check className="w-4 h-4 stroke-[3]" /> : s.icon}
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold block truncate leading-tight">
                  STEP {s.id}: {s.label}
                </span>
                <span className="text-[10px] text-slate-500 block truncate leading-tight mt-0.5 font-medium">
                  {s.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
