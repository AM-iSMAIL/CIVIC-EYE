'use client';

import React from 'react';
import {
  PieChart,
  BarChart3,
  Layers,
  Activity,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';
import type { AdminAnalyticsData } from '@/types/admin';

interface AnalyticsChartsProps {
  analytics: AdminAnalyticsData;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analytics }) => {
  const {
    categoryDistribution,
    priorityDistribution,
    statusDistribution,
    totalClusters,
    totalReports,
    duplicateConsensusRate,
    avgReportsPerCluster,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Defect Clusters
            </span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalClusters}</div>
          <p className="text-[11px] text-slate-500 font-mono">
            {totalReports} total citizen reports
          </p>
        </Card>

        <Card className="p-4 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Duplicate Consensus Rate
            </span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {duplicateConsensusRate}%
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Corroborated citizen report ratio
          </p>
        </Card>

        <Card className="p-4 border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Reports per Cluster
            </span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {avgReportsPerCluster}
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Consensus confidence density
          </p>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="border-slate-800 bg-slate-900/90">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Incidents by Service Category
            </CardTitle>
            <CardDescription>
              Volume of citizen defect reports by municipal jurisdiction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {categoryDistribution.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-6">
                No incidents reported yet.
              </p>
            ) : (
              categoryDistribution.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat.label}</span>
                    <span className="text-slate-400 font-mono">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${Math.max(cat.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Priority Tier Distribution */}
        <Card className="border-slate-800 bg-slate-900/90">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Priority Tier Distribution
            </CardTitle>
            <CardDescription>
              Severity classification across active municipal workloads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {priorityDistribution.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-6">
                No priority data recorded yet.
              </p>
            ) : (
              priorityDistribution.map((pri) => {
                const color =
                  pri.tier === 'critical'
                    ? 'bg-rose-500'
                    : pri.tier === 'high'
                    ? 'bg-orange-500'
                    : pri.tier === 'medium'
                    ? 'bg-cyan-500'
                    : 'bg-emerald-500';

                return (
                  <div key={pri.tier} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 uppercase font-semibold text-[11px]">
                        {pri.tier} Tier
                      </span>
                      <span className="text-slate-400 font-mono">
                        {pri.count} clusters ({pri.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-300`}
                        style={{ width: `${Math.max(pri.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Status Pipeline Distribution */}
        <Card className="border-slate-800 bg-slate-900/90 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Dispatch Status Pipeline
            </CardTitle>
            <CardDescription>
              Work order progression from citizen intake to municipal resolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {statusDistribution.map((st) => (
                <div
                  key={st.status}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    {st.status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-xl font-black text-white font-mono">
                    {st.count}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {st.percentage}% of workload
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
