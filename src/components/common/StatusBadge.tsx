import React from 'react';
import { IssueSeverity, IssueStatus } from '@/types/incident';
import { AlertCircle, CheckCircle2, Clock, Eye, Sparkles } from 'lucide-react';

export interface StatusBadgeProps {
  type: 'status' | 'severity';
  value: IssueStatus | IssueSeverity;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  value,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  if (type === 'severity') {
    const severity = value as IssueSeverity;
    const severityConfig: Record<
      IssueSeverity,
      { bg: string; text: string; border: string; dot: string; label: string }
    > = {
      low: {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        label: 'Low Severity',
      },
      medium: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: 'Medium Severity',
      },
      high: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        label: 'High Severity',
      },
      critical: {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500 animate-pulse',
        label: 'Critical Hazard',
      },
    };

    const cfg = severityConfig[severity] || severityConfig.medium;

    return (
      <span
        className={`inline-flex items-center font-medium rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} ${className}`}
      >
        {showIcon && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
        <span>{cfg.label}</span>
      </span>
    );
  }

  // Issue Status
  const status = value as IssueStatus;
  const statusConfig: Record<
    IssueStatus,
    { bg: string; text: string; border: string; label: string; icon: React.ReactNode }
  > = {
    reported: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: 'Reported',
      icon: <Clock className="w-3 h-3 text-slate-500" />,
    },
    submitted: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      label: 'Submitted',
      icon: <Clock className="w-3 h-3 text-slate-500" />,
    },
    analyzing: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      label: 'AI Analyzing',
      icon: <Sparkles className="w-3 h-3 animate-spin text-blue-600" />,
    },
    in_review: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Under Review',
      icon: <Eye className="w-3 h-3 text-amber-600" />,
    },
    acknowledged: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      label: 'Acknowledged',
      icon: <Clock className="w-3 h-3 text-sky-600" />,
    },
    in_progress: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      label: 'In Progress',
      icon: <AlertCircle className="w-3 h-3 text-indigo-600" />,
    },
    resolved: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Resolved',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
    },
    rejected: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      label: 'Rejected',
      icon: <AlertCircle className="w-3 h-3 text-rose-600" />,
    },
  };

  const cfg = statusConfig[status] || statusConfig.submitted;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} ${className}`}
    >
      {showIcon && cfg.icon}
      <span>{cfg.label}</span>
    </span>
  );
};
