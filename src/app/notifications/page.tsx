'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { CitizenGuard } from '@/components/auth/CitizenGuard';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/services/firebase';

type IncidentStatus = 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';

interface NotificationItem {
  id: string;
  incidentId: string;
  category: string;
  status: IncidentStatus;
  updatedAt: { seconds: number } | null;
  createdAt: { seconds: number } | null;
}

const statusConfig: Record<
  IncidentStatus,
  { label: string; color: string; icon: React.ReactNode; message: string }
> = {
  reported: {
    label: 'Submitted',
    color: 'text-slate-400 border-slate-700/60 bg-slate-900/60',
    icon: <Clock className="w-4 h-4 text-slate-400" />,
    message: 'Your report has been received and is awaiting review.',
  },
  acknowledged: {
    label: 'Acknowledged',
    color: 'text-blue-400 border-blue-800/50 bg-blue-950/20',
    icon: <Sparkles className="w-4 h-4 text-blue-400" />,
    message: 'Municipal teams have acknowledged your report.',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-amber-400 border-amber-800/50 bg-amber-950/20',
    icon: <ArrowRight className="w-4 h-4 text-amber-400" />,
    message: 'Work crews have been dispatched to address this issue.',
  },
  resolved: {
    label: 'Resolved',
    color: 'text-emerald-400 border-emerald-800/50 bg-emerald-950/20',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    message: 'This civic issue has been resolved. Thank you for reporting!',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-rose-400 border-rose-800/50 bg-rose-950/20',
    icon: <XCircle className="w-4 h-4 text-rose-400" />,
    message: 'This report could not be processed. It may be a duplicate or outside jurisdiction.',
  },
};

function NotificationsContent() {
  const { firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured() || !db || !firebaseUser) {
      setLoading(false);
      return;
    }

    // Subscribe to the citizen's own incidents, ordered by most recently updated
    const q = query(
      collection(db, 'incidents'),
      where('reporter.uid', '==', firebaseUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: NotificationItem[] = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            incidentId: doc.id,
            category: data.category ?? 'civic_issue',
            status: (data.status ?? 'reported') as IncidentStatus,
            updatedAt: data.updatedAt ?? null,
            createdAt: data.createdAt ?? null,
          };
        });
        setNotifications(items);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [firebaseUser]);

  const formatDate = (ts: NotificationItem['createdAt']) => {
    if (!ts) return '—';
    const d = new Date(ts.seconds * 1000);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3_600_000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Bell className="w-4 h-4 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
        </div>
        <p className="text-sm text-slate-400">
          Status updates for all your civic issue reports.
        </p>
      </div>

      {/* Notification Feed */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-slate-500" />}
          title="No notifications yet"
          description="Once you submit a civic issue report, you'll receive status updates here as municipal teams process your report."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const cfg = statusConfig[notif.status] ?? statusConfig.reported;
            return (
              <Link key={notif.id} href="/my-reports" className="block group">
                <Card
                  className={`p-4 border transition-all duration-150 group-hover:scale-[1.01] ${cfg.color}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{cfg.icon}</div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white capitalize">
                          {notif.category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {formatDate(notif.updatedAt ?? notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{cfg.message}</p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${cfg.color} border`}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-[10px] font-mono text-slate-600">
                          #{notif.incidentId.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <CitizenGuard>
      <NotificationsContent />
    </CitizenGuard>
  );
}
