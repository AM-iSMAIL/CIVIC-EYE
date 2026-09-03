'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, UploadCloud, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface ImageCaptureDropzoneProps {
  selectedFile: File | null;
  previewUrl: string | null;
  onImageSelected: (file: File) => void;
  onImageRemoved: () => void;
  isAnalyzing?: boolean;
}

export const ImageCaptureDropzone: React.FC<ImageCaptureDropzoneProps> = ({
  selectedFile,
  previewUrl,
  onImageSelected,
  onImageRemoved,
  isAnalyzing = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP).');
      return;
    }
    onImageSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Hidden standard file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {/* Hidden camera capture input */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 group shadow-lg">
          <div className="relative w-full h-64 sm:h-72 bg-slate-950 flex items-center justify-center">
            <Image
              src={previewUrl}
              alt="Uploaded civic issue"
              fill
              unoptimized
              className="object-contain"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-emerald-400">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-sm font-medium text-white">
                  Gemini AI Analyzing Damage...
                </span>
              </div>
            )}
          </div>

          {/* Action Overlay */}
          <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate font-medium">
                {selectedFile?.name ?? 'Photo Evidence Loaded'}
              </span>
              {selectedFile && (
                <span className="text-[11px] text-slate-500 shrink-0">
                  ({(selectedFile.size / 1024).toFixed(0)} KB)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Camera className="w-3.5 h-3.5" />}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onImageRemoved}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-emerald-500 bg-emerald-950/20'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mx-auto mb-4 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-semibold text-white mb-1">
            Capture or Upload Photo Evidence
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            Drag & drop an image here, choose from your camera roll, or snap a live photo at the scene.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                cameraInputRef.current?.click();
              }}
              leftIcon={<Camera className="w-4 h-4 text-emerald-400" />}
            >
              Take Photo
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              leftIcon={<UploadCloud className="w-4 h-4" />}
            >
              Browse Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
