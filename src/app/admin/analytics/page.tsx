'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { getAdminAnalytics } from '@/services/admin';
import type { AdminAnalyticsData } from '@/types/admin';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsData>({
    categoryDistribution: [],
    priorityDistribution: [],
    statusDistribution: [],
    totalClusters: 0,
    totalReports: 0,
    duplicateConsensusRate: 0,
    avgReportsPerCluster: 1.0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = useCallback(async () => {
    setIsRefreshing(true);
    const data = await getAdminAnalytics();
    setAnalytics(data);
    setLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getAdminAnalytics().then((data) => {
      if (isMounted) {
        setAnalytics(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Municipal Analytics"
        description="Comprehensive real-time telemetry on service category distributions, priority density, and duplicate report consensus."
        breadcrumbs={[
          { label: 'Admin Hub', href: '/admin' },
          { label: 'Analytics' },
        ]}
        onRefresh={loadAnalytics}
        isRefreshing={isRefreshing}
      />

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-mono">
          Aggregating telemetry from Firestore collections...
        </div>
      ) : (
        <AnalyticsCharts analytics={analytics} />
      )}
    </div>
  );
}
