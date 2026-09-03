'use client';

import React, { useEffect, useState } from 'react';
import { FileText, PlusCircle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { CitizenGuard } from '@/components/auth/CitizenGuard';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/context/AuthContext';
import type { IssueStatus } from '@/types/incident';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/services/firebase';

interface MyReport {
  id: string;
  category: string;
  severity: string;
  status: string;
  description?: string;
  createdAt: { seconds: number } | null;
  location?: { latitude: number; longitude: number };
}

function MyReportsContent() {
  const { firebaseUser } = useAuth();
  const [reports, setReports] = useState<MyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured() || !db || !firebaseUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'incidents'),
      where('reporter.uid', '==', firebaseUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MyReport, 'id'>),
        }));
        setReports(docs);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [firebaseUser]);

  const formatDate = (ts: MyReport['createdAt']) => {
    if (!ts) return '—';
    return new Date(ts.seconds * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">My Reports</h1>
          </div>
          <p className="text-sm text-slate-500">
            Track the status of all civic issues you&apos;ve submitted.
          </p>
        </div>
        <Link href="/report">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Report New Issue
          </Button>
        </Link>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Total Submitted',
            value: reports.length,
            icon: <FileText className="w-5 h-5 text-blue-600" />,
            badge: 'bg-blue-50 border-blue-100',
          },
          {
            label: 'In Progress',
            value: reports.filter((r) => r.status === 'in_progress').length,
            icon: <Clock className="w-5 h-5 text-amber-600" />,
            badge: 'bg-amber-50 border-amber-100',
          },
          {
            label: 'Resolved',
            value: reports.filter((r) => r.status === 'resolved').length,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
            badge: 'bg-emerald-50 border-emerald-100',
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="p-5 flex flex-col items-center text-center gap-2 bg-white border border-slate-200/80 shadow-sm"
          >
            <div className={`p-2.5 rounded-xl border ${stat.badge}`}>{stat.icon}</div>
            <span className="text-2xl font-black text-slate-950">{stat.value}</span>
            <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
          </Card>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-slate-100/80 border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 text-slate-400" />}
          title="No reports yet"
          description="You haven't submitted any civic issue reports. Tap the button above to file your first report."
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="p-4 bg-white border border-slate-200/80 hover:border-slate-300 transition-colors shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 capitalize">
                      {report.category?.replace(/_/g, ' ') ?? 'Civic Issue'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">#{report.id.slice(0, 8)}</span>
                  </div>
                  {report.description && (
                    <p className="text-xs text-slate-600 truncate max-w-md">{report.description}</p>
                  )}
                  <span className="text-[11px] text-slate-400">{formatDate(report.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge type="status" value={report.status as IssueStatus} size="sm" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyReportsPage() {
  return (
    <CitizenGuard>
      <MyReportsContent />
    </CitizenGuard>
  );
}
