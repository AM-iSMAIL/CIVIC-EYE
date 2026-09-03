'use client';

import React from 'react';
import {
  FileText,
  AlertOctagon,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import type { AdminDashboardStats } from '@/types/admin';

interface DashboardStatsProps {
  stats: AdminDashboardStats;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Incidents',
      value: stats.totalIncidents,
      subtitle: 'Recorded citizen defect logs',
      icon: <FileText className="w-4 h-4 text-slate-600" />,
      accent: 'border-slate-200 bg-slate-50',
      badge: 'All Time',
    },
    {
      title: 'Active Issues',
      value: stats.activeIssues,
      subtitle: 'Pending dispatch or in-flight',
      icon: <Clock className="w-4 h-4 text-blue-600" />,
      accent: 'border-blue-100 bg-blue-50',
      badge: 'Unresolved',
    },
    {
      title: 'Critical Priority',
      value: stats.criticalCount,
      subtitle: 'Immediate safety hazards',
      icon: <AlertOctagon className="w-4 h-4 text-rose-600" />,
      accent: 'border-rose-100 bg-rose-50',
      badge: 'Critical Tier',
    },
    {
      title: 'High Priority',
      value: stats.highCount,
      subtitle: 'Expedited civic repairs',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      accent: 'border-amber-100 bg-amber-50',
      badge: 'High Tier',
    },
    {
      title: 'Duplicate Reports',
      value: stats.duplicateReportsCount,
      subtitle: 'Consensus corroborations',
      icon: <Layers className="w-4 h-4 text-indigo-600" />,
      accent: 'border-indigo-100 bg-indigo-50',
      badge: 'Clustered',
    },
    {
      title: 'Resolved Issues',
      value: stats.resolvedCount,
      subtitle: 'Successfully closed work orders',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      accent: 'border-emerald-100 bg-emerald-50',
      badge: 'Verified',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((c) => (
        <Card key={c.title} className="p-4 bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-xl border ${c.accent}`}>
              {c.icon}
            </div>
            <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
              {c.badge}
            </span>
          </div>

          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {c.title}
          </span>
          <div className="text-2xl font-black text-slate-950 mt-0.5 mb-1 font-mono">
            {c.value}
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            {c.subtitle}
          </p>
        </Card>
      ))}
    </div>
  );
};
