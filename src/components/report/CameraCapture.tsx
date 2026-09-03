'use client';

import React, { useRef, useState } from 'react';
import {
  Camera,
  UploadCloud,
  X,
  AlertCircle,
  Loader2,
  Aperture,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useCamera } from '@/hooks/useCamera';
import type { CapturedPhotoResult } from '@/hooks/useCamera';

interface CameraCaptureProps {
  onPhotoCaptured: (result: CapturedPhotoResult) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoCaptured,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startingCamera, setStartingCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const {
    videoRef,
    isActive,
    isSupported,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    clearError,
  } = useCamera();

  const handleStartCamera = async () => {
    setStartingCamera(true);
    clearError();
    await startCamera();
    setStartingCamera(false);
  };

  const handleCapture = async () => {
    setCapturing(true);
    const result = await capturePhoto();
    setCapturing(false);
    if (result) {
      onPhotoCaptured(result);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    const capturedAt = Date.now();
    const previewUrl = URL.createObjectURL(file);

    onPhotoCaptured({
      file,
      previewUrl,
      capturedAt,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
      {/* Hidden Fallback HTML File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              STEP 2: Photographic Evidence
            </h3>
            <p className="text-xs text-slate-400">
              Snap a live photo of the civic defect or choose from device
            </p>
          </div>
        </div>

        {isActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={stopCamera}
            leftIcon={<X className="w-4 h-4 text-rose-400" />}
            className="text-rose-300 hover:bg-rose-950/30"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Camera Permission / Device Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-rose-200 block">
                Camera Notice
              </span>
              <p className="text-rose-300 leading-relaxed">{error.message}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
            >
              Upload Photo Instead
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleStartCamera}
              disabled={startingCamera}
              leftIcon={<Camera className="w-3.5 h-3.5" />}
            >
              Retry Camera
            </Button>
          </div>
        </div>
      )}

      {/* Active Camera Viewfinder */}
      {isActive ? (
        <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-700 aspect-4/3 max-h-[460px] flex items-center justify-center shadow-2xl">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover"
          />

          {/* Viewfinder Target Framing Guides */}
          <div className="absolute inset-4 sm:inset-8 border border-white/25 rounded-xl pointer-events-none flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-emerald-400/40 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
          </div>

          {/* Shutter Capture Controls Overlay */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4 z-10">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={stopCamera}
              className="bg-black/60 text-white hover:bg-black/80 backdrop-blur-md rounded-full px-4"
            >
              Cancel
            </Button>

            <button
              type="button"
              onClick={handleCapture}
              disabled={capturing}
              className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 border-4 border-slate-900 shadow-2xl flex items-center justify-center group active:scale-95 transition-all"
              title="Take Photograph"
            >
              {capturing ? (
                <Loader2 className="w-7 h-7 text-slate-900 animate-spin" />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center">
                  <Aperture className="w-6 h-6 text-slate-900" />
                </div>
              )}
            </button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-black/60 text-white hover:bg-black/80 backdrop-blur-md rounded-full px-4"
            >
              Upload
            </Button>
          </div>
        </div>
      ) : (
        /* Camera Launch / File Fallback Dashboard */
        <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-8 sm:p-12 text-center bg-slate-950/40 transition-all space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
            <Camera className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-semibold text-white">
              Real Camera & Evidence Capture
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Launch your device camera to snap a live photo of the issue, or select an image from your device storage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {isSupported && (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleStartCamera}
                disabled={startingCamera}
                leftIcon={
                  startingCamera ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )
                }
                className="w-full sm:w-auto shadow-md shadow-emerald-900/30"
              >
                {startingCamera ? 'Starting Camera...' : 'Enable Camera'}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<UploadCloud className="w-4 h-4 text-emerald-400" />}
              className="w-full sm:w-auto"
            >
              Upload Photo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
