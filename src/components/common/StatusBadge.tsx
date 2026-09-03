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
        bg: 'bg-slate-800/80',
        text: 'text-slate-300',
        border: 'border-slate-700',
        dot: 'bg-slate-400',
        label: 'Low Severity',
      },
      medium: {
        bg: 'bg-amber-950/40',
        text: 'text-amber-300',
        border: 'border-amber-800/50',
        dot: 'bg-amber-400',
        label: 'Medium Severity',
      },
      high: {
        bg: 'bg-orange-950/40',
        text: 'text-orange-300',
        border: 'border-orange-800/50',
        dot: 'bg-orange-400',
        label: 'High Severity',
      },
      critical: {
        bg: 'bg-rose-950/50',
        text: 'text-rose-300',
        border: 'border-rose-800/60',
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
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-300',
      border: 'border-emerald-800/50',
      label: 'Reported',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
    },
    submitted: {
      bg: 'bg-slate-800/80',
      text: 'text-slate-300',
      border: 'border-slate-700',
      label: 'Submitted',
      icon: <Clock className="w-3 h-3" />,
    },
    analyzing: {
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-300',
      border: 'border-cyan-800/50',
      label: 'AI Analyzing',
      icon: <Sparkles className="w-3 h-3 animate-spin text-cyan-400" />,
    },
    in_review: {
      bg: 'bg-amber-950/40',
      text: 'text-amber-300',
      border: 'border-amber-800/50',
      label: 'Under Review',
      icon: <Eye className="w-3 h-3" />,
    },
    acknowledged: {
      bg: 'bg-cyan-950/40',
      text: 'text-cyan-300',
      border: 'border-cyan-800/50',
      label: 'Acknowledged',
      icon: <Clock className="w-3 h-3 text-cyan-400" />,
    },
    in_progress: {
      bg: 'bg-purple-950/40',
      text: 'text-purple-300',
      border: 'border-purple-800/50',
      label: 'In Progress',
      icon: <AlertCircle className="w-3 h-3" />,
    },
    resolved: {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-300',
      border: 'border-emerald-800/50',
      label: 'Resolved',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
    },
    rejected: {
      bg: 'bg-rose-950/40',
      text: 'text-rose-300',
      border: 'border-rose-800/50',
      label: 'Rejected',
      icon: <AlertCircle className="w-3 h-3 text-rose-400" />,
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
