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
      icon: <FileText className="w-5 h-5 text-slate-300" />,
      accent: 'border-slate-700 bg-slate-800/60',
      badge: 'All Time',
    },
    {
      title: 'Active Issues',
      value: stats.activeIssues,
      subtitle: 'Pending dispatch or in-flight',
      icon: <Clock className="w-5 h-5 text-cyan-400" />,
      accent: 'border-cyan-800/40 bg-cyan-950/20',
      badge: 'Unresolved',
    },
    {
      title: 'Critical Priority',
      value: stats.criticalCount,
      subtitle: 'Immediate safety hazards (75–100)',
      icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
      accent: 'border-rose-800/40 bg-rose-950/20',
      badge: 'Critical Tier',
    },
    {
      title: 'High Priority',
      value: stats.highCount,
      subtitle: 'Expedited civic repairs (50–74)',
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      accent: 'border-orange-800/40 bg-orange-950/20',
      badge: 'High Tier',
    },
    {
      title: 'Duplicate Reports',
      value: stats.duplicateReportsCount,
      subtitle: 'Consensus corroborations',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      accent: 'border-emerald-800/40 bg-emerald-950/20',
      badge: 'Clustered',
    },
    {
      title: 'Resolved Issues',
      value: stats.resolvedCount,
      subtitle: 'Successfully closed work orders',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      accent: 'border-emerald-800/40 bg-emerald-950/20',
      badge: 'Verified',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((c) => (
        <Card key={c.title} className="p-4 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg border ${c.accent}`}>
              {c.icon}
            </div>
            <span className="text-[10px] font-medium text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
              {c.badge}
            </span>
          </div>

          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            {c.title}
          </span>
          <div className="text-2xl font-black text-white mt-0.5 mb-1 font-mono">
            {c.value}
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            {c.subtitle}
          </p>
        </Card>
      ))}
    </div>
  );
};
