'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface CameraError {
  code: 'denied' | 'unavailable' | 'unsupported' | 'insecure' | 'generic';
  message: string;
}

export interface CapturedPhotoResult {
  file: File;
  previewUrl: string;
  capturedAt: number;
}

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  isSupported: boolean;
  error: CameraError | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  capturePhoto: () => Promise<CapturedPhotoResult | null>;
  clearError: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);
  const [isSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  });

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = useCallback(async (): Promise<boolean> => {
    setError(null);

    if (typeof window === 'undefined') return false;

    // Check secure context (camera requires HTTPS or localhost)
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      const err: CameraError = {
        code: 'insecure',
        message: 'Camera access requires a secure connection (HTTPS).',
      };
      setError(err);
      return false;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err: CameraError = {
        code: 'unsupported',
        message:
          'Camera access is not supported by your browser. Please choose an existing photo from your device.',
      };
      setError(err);
      return false;
    }

    // Stop any existing stream before starting a new one
    stopCamera();

    try {
      // First attempt: Prefer rear-facing environment camera for mobile issue reporting
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback: Default video device if environment constraint fails
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
      setError(null);
      return true;
    } catch (err: unknown) {
      const mediaError = err as { name?: string; message?: string };
      let code: CameraError['code'] = 'generic';
      let message =
        'Camera access was denied or failed. You can enable camera permission in your browser settings or choose a photo from your device.';

      if (
        mediaError.name === 'NotAllowedError' ||
        mediaError.name === 'PermissionDeniedError'
      ) {
        code = 'denied';
        message =
          'Camera access was denied. You can enable camera permission in your browser settings or choose a photo from your device.';
      } else if (
        mediaError.name === 'NotFoundError' ||
        mediaError.name === 'DevicesNotFoundError'
      ) {
        code = 'unavailable';
        message =
          'No camera device was detected on your system. Please upload a photo from your device instead.';
      }

      setError({ code, message });
      stopCamera();
      return false;
    }
  }, [stopCamera]);

  const capturePhoto = useCallback(async (): Promise<CapturedPhotoResult | null> => {
    const video = videoRef.current;
    if (!video || !streamRef.current || !isActive) {
      return null;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, width, height);

    // Stop active camera stream immediately after freezing frame
    stopCamera();

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }

          const capturedAt = Date.now();
          const filename = `civic_evidence_${capturedAt}.jpg`;
          const file = new File([blob], filename, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);

          resolve({
            file,
            previewUrl,
            capturedAt,
          });
        },
        'image/jpeg',
        0.92
      );
    });
  }, [isActive, stopCamera]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    videoRef,
    isActive,
    isSupported,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    clearError,
  };
}
