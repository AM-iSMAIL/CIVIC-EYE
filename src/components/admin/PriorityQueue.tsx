'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  MapPin,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { AdminIncidentRow } from '@/types/admin';
import { CATEGORY_LABELS, HAZARD_COLORS } from '@/types/analysis';

interface PriorityQueueProps {
  incidents: AdminIncidentRow[];
  onSelectIncident: (incident: AdminIncidentRow) => void;
  loading?: boolean;
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
  incidents,
  onSelectIncident,
  loading = false,
}) => {
  const [tierFilter, setTierFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const filteredIncidents = useMemo(() => {
    if (tierFilter === 'all') return incidents;
    return incidents.filter((i) => (i.priority?.level || 'medium') === tierFilter);
  }, [incidents, tierFilter]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 font-mono">
        Loading real-time prioritized triage queue...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tier Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'all', label: 'All Tiers', count: incidents.length },
            {
              id: 'critical',
              label: 'Critical (75–100)',
              count: incidents.filter((i) => i.priority?.level === 'critical').length,
            },
            {
              id: 'high',
              label: 'High (50–74)',
              count: incidents.filter((i) => i.priority?.level === 'high').length,
            },
            {
              id: 'medium',
              label: 'Medium (25–49)',
              count: incidents.filter((i) => i.priority?.level === 'medium').length,
            },
            {
              id: 'low',
              label: 'Low (0–24)',
              count: incidents.filter((i) => i.priority?.level === 'low').length,
            },
          ] as const
        ).map((tab) => {
          const isActive = tierFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTierFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Queue Items */}
      {filteredIncidents.length === 0 ? (
        <div className="p-12 text-center space-y-2 border border-slate-200 rounded-2xl bg-white shadow-xs">
          <p className="text-sm font-bold text-slate-900">Queue Clear</p>
          <p className="text-xs text-slate-500">
            No active civic hazards in this priority tier require dispatch attention.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((item, idx) => {
            const priScore = item.priority?.score ?? item.severity * 10;
            const priLevel = item.priority?.level || 'medium';
            const hazardStyle = HAZARD_COLORS[item.hazardLevel] || HAZARD_COLORS.medium;

            return (
              <Card
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className="p-4 border border-slate-200/80 bg-white hover:border-slate-300 shadow-sm transition-all cursor-pointer rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Rank & Information */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 font-mono font-black text-sm text-slate-600">
                      #{idx + 1}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {CATEGORY_LABELS[item.category] || item.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${hazardStyle.bg} ${hazardStyle.text} ${hazardStyle.border}`}
                        >
                          {item.hazardLevel}
                        </span>
                        <StatusBadge type="status" value={item.status} size="sm" />
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          {item.latitude.toFixed(4)}°, {item.longitude.toFixed(4)}°
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Priority Metrics & Action */}
                  <div className="flex items-center gap-4 shrink-0 sm:border-l sm:border-slate-100 sm:pl-4 justify-between sm:justify-end">
                    {/* Priority & Reports */}
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-xs font-medium text-slate-400 uppercase">
                          Priority
                        </span>
                        <span className="text-base font-black text-slate-950 font-mono">
                          {priScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold font-mono justify-end">
                        <span>{item.reportCount} reports</span>
                        {item.reportCount > 1 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(item);
                      }}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Inspect
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
