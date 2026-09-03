'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle2, RotateCcw, Check, FileCheck, Clock, HardDrive } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface PhotoPreviewProps {
  photo: File;
  previewUrl: string;
  capturedAt: number;
  isConfirmed: boolean;
  onRetake: () => void;
  onConfirm: () => void;
}

export const PhotoPreview: React.FC<PhotoPreviewProps> = ({
  photo,
  previewUrl,
  capturedAt,
  isConfirmed,
  onRetake,
  onConfirm,
}) => {
  const formattedSize = (photo.size / 1024).toFixed(0);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-950 tracking-wide uppercase">
            STEP 2: Captured Photo Preview
          </h3>
        </div>

        {isConfirmed ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            Photo Confirmed
          </span>
        ) : (
          <span className="text-xs text-amber-600 font-medium">
            Awaiting Confirmation
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 aspect-4/3 max-h-[460px] shadow-sm">
        <Image
          src={previewUrl}
          alt="Captured civic issue preview"
          fill
          unoptimized
          className="object-contain"
        />

        {/* Status Chip Overlay */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-center gap-2 shadow-sm">
          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate max-w-[200px] font-medium">{photo.name}</span>
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono text-slate-600">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Size: {formattedSize} KB</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            Time: {new Date(capturedAt).toLocaleTimeString()}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hidden sm:flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-emerald-700 font-semibold">Ready for AI</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onRetake}
          leftIcon={<RotateCcw className="w-4 h-4 text-slate-500" />}
          className="w-full sm:w-auto"
        >
          Retake Photo
        </Button>

        {!isConfirmed && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onConfirm}
            leftIcon={<Check className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Use Photo
          </Button>
        )}
      </div>
    </div>
  );
};
