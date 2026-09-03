'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Play,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { updateIncidentStatus } from '@/services/admin';
import type { IssueStatus } from '@/types/incident';
import { ALLOWED_STATUS_TRANSITIONS } from '@/types/admin';

interface StatusActionsProps {
  incidentId: string;
  currentStatus: IssueStatus;
  clusterId?: string | null;
  onStatusUpdated?: (newStatus: IssueStatus) => void;
  size?: 'sm' | 'md';
}

export const StatusActions: React.FC<StatusActionsProps> = ({
  incidentId,
  currentStatus,
  clusterId,
  onStatusUpdated,
  size = 'md',
}) => {
  const [targetStatus, setTargetStatus] = useState<IssueStatus | null>(null);
  const [operatorNote, setOperatorNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  const handleConfirm = async () => {
    if (!targetStatus) return;

    setIsSubmitting(true);
    setError(null);

    const result = await updateIncidentStatus(
      incidentId,
      targetStatus,
      currentStatus,
      clusterId,
      operatorNote
    );

    setIsSubmitting(false);

    if (result.success) {
      if (onStatusUpdated) onStatusUpdated(targetStatus);
      setTargetStatus(null);
      setOperatorNote('');
    } else {
      setError(result.error || 'Failed to update status.');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Acknowledge Button */}
      {allowed.includes('acknowledged') && (
        <Button
          variant="outline"
          size={size}
          onClick={() => setTargetStatus('acknowledged')}
          className="text-cyan-400 border-cyan-800/60 hover:bg-cyan-950/40"
          leftIcon={<Clock className="w-3.5 h-3.5" />}
        >
          Acknowledge
        </Button>
      )}

      {/* Start Work / In Progress */}
      {allowed.includes('in_progress') && (
        <Button
          variant="outline"
          size={size}
          onClick={() => setTargetStatus('in_progress')}
          className="text-amber-400 border-amber-800/60 hover:bg-amber-950/40"
          leftIcon={<Play className="w-3.5 h-3.5" />}
        >
          Start Work
        </Button>
      )}

      {/* Resolve Button */}
      {allowed.includes('resolved') && (
        <Button
          variant="primary"
          size={size}
          onClick={() => setTargetStatus('resolved')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
          leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
        >
          Mark Resolved
        </Button>
      )}

      {/* Reject Button */}
      {allowed.includes('rejected') && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => setTargetStatus('rejected')}
          className="text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
          leftIcon={<XCircle className="w-3.5 h-3.5" />}
        >
          Reject
        </Button>
      )}

      {/* Reinstate (if rejected) */}
      {currentStatus === 'rejected' && allowed.includes('reported') && (
        <Button
          variant="outline"
          size={size}
          onClick={() => setTargetStatus('reported')}
          className="text-slate-300 border-slate-700"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reinstate
        </Button>
      )}

      {/* Confirmation Modal */}
      {targetStatus && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirm Status Transition
                </h3>
                <p className="text-xs text-slate-400">
                  Update dispatch status from <span className="font-semibold text-slate-200 uppercase">{currentStatus}</span> to <span className="font-semibold text-emerald-400 uppercase">{targetStatus}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Operator Dispatch Note (Optional)
              </label>
              <textarea
                value={operatorNote}
                onChange={(e) => setOperatorNote(e.target.value)}
                placeholder="e.g. Work crew dispatched to site / repaired asphalt overlay."
                className="w-full h-20 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-medium">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTargetStatus(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : `Confirm: ${targetStatus}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
