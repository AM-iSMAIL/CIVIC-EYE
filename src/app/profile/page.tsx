'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CitizenGuard } from '@/components/auth/CitizenGuard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import {
  User,
  Mail,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  LogOut,
  PlusCircle,
  Award,
} from 'lucide-react';

function ProfileContent() {
  const { currentUser, signOut } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Citizen Profile
        </h1>
        <p className="text-sm text-slate-500">
          Manage your civic credentials, reporting statistics, and community impact.
        </p>
      </div>

      {/* Main Profile Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {currentUser?.photoURL ? (
              <Image
                src={currentUser.photoURL}
                alt={currentUser.displayName ?? 'User avatar'}
                width={64}
                height={64}
                unoptimized
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <User className="w-8 h-8" />
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-950">
                  {currentUser?.displayName || 'Citizen Reporter'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Verified Citizen
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser?.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/report" className="flex-1 sm:flex-initial">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                New Report
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-500" />}
            >
              Sign out
            </Button>
          </div>
        </div>

        {/* Identity Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Account UID</span>
            <p className="text-xs font-mono text-slate-800 truncate">
              {currentUser?.uid || '—'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Clearance Level</span>
            <p className="text-xs font-semibold text-slate-800 capitalize">
              {currentUser?.role || 'Citizen'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Member Since</span>
            <p className="text-xs font-medium text-slate-800">
              {currentUser?.createdAt
                ? new Date(currentUser.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Current Session'}
            </p>
          </div>
        </div>
      </Card>

      {/* Community Impact Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-950 block">Live Sync</span>
            <span className="text-xs text-slate-500">Incident Tracking</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-950 block">AI Verified</span>
            <span className="text-xs text-slate-500">Multimodal Triage</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-950 block">Active</span>
            <span className="text-xs text-slate-500">City Contributor</span>
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/my-reports" className="block group">
          <Card hoverEffect className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  My Incident Reports
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect status progression and municipal actions for your reports.
                </p>
              </div>
              <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
            </div>
          </Card>
        </Link>

        <Link href="/notifications" className="block group">
          <Card hoverEffect className="p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Notification Center
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time municipal dispatch and repair completion alerts.
                </p>
              </div>
              <Clock className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <CitizenGuard>
      <ProfileContent />
    </CitizenGuard>
  );
}
