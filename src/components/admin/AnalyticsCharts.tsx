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
        <Card className="p-4 bg-white border border-slate-200/80 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Defect Clusters
            </span>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">{totalClusters}</div>
          <p className="text-[11px] text-slate-400 font-mono">
            {totalReports} total citizen reports
          </p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Duplicate Consensus Rate
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            {duplicateConsensusRate}%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Corroborated citizen report ratio
          </p>
        </Card>

        <Card className="p-4 bg-white border border-slate-200/80 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Reports per Cluster
            </span>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            {avgReportsPerCluster}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Consensus confidence density
          </p>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-slate-950 font-bold">
              <PieChart className="w-4 h-4 text-blue-600" />
              Incidents by Service Category
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Volume of citizen defect reports by municipal jurisdiction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-4">
            {categoryDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono text-center py-6">
                No incidents reported yet.
              </p>
            ) : (
              categoryDistribution.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-bold">{cat.label}</span>
                    <span className="text-slate-500 font-mono">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${Math.max(cat.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Priority Tier Distribution */}
        <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-slate-950 font-bold">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              Priority Tier Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Severity classification across active municipal workloads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-4">
            {priorityDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono text-center py-6">
                No priority data recorded yet.
              </p>
            ) : (
              priorityDistribution.map((pri) => {
                const color =
                  pri.tier === 'critical'
                    ? 'bg-rose-500'
                    : pri.tier === 'high'
                    ? 'bg-amber-500'
                    : pri.tier === 'medium'
                    ? 'bg-blue-500'
                    : 'bg-emerald-500';

                return (
                  <div key={pri.tier} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 uppercase font-bold text-[11px]">
                        {pri.tier} Tier
                      </span>
                      <span className="text-slate-500 font-mono">
                        {pri.count} clusters ({pri.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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
        <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl lg:col-span-2">
          <CardHeader className="border-b border-slate-100 pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-slate-950 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Dispatch Status Pipeline
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Work order progression from citizen intake to municipal resolution
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {statusDistribution.map((st) => (
                <div
                  key={st.status}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    {st.status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-xl font-black text-slate-950 font-mono">
                    {st.count}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
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
