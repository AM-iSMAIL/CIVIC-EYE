'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Send,
  Loader2,
  User,
  Info,
  CheckCircle2,
  MapPin,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { AuthRequiredCard } from '@/components/auth/AuthRequiredCard';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LocationCapture } from '@/components/report/LocationCapture';
import { CameraCapture } from '@/components/report/CameraCapture';
import { PhotoPreview } from '@/components/report/PhotoPreview';
import { ReportProgress } from '@/components/report/ReportProgress';
import { AiAnalysisCard } from '@/components/report/AiAnalysisCard';
import { ReportSummaryCard } from '@/components/report/ReportSummaryCard';
import { ReportSuccessCard } from '@/components/report/ReportSuccessCard';
import { createIncident } from '@/services/firestore';
import type { ReportDraft } from '@/types/report';
import type { CapturedPhotoResult } from '@/hooks/useCamera';
import type { CivicCategory } from '@/types/analysis';

export default function ReportPage() {
  const { currentUser, loading: authLoading } = useAuth();

  // Geolocation Hook (Authoritative browser GPS)
  const {
    location,
    loading: geoLoading,
    error: geoError,
    isStale,
    detectLocation,
  } = useGeolocation();

  // Client-Side Report Draft
  const [draft, setDraft] = useState<ReportDraft>({
    photo: null,
    photoPreviewUrl: null,
    capturedAt: null,
    photoConfirmed: false,
    location: null,
    aiAnalysis: null,
    userCategoryOverride: null,
  });

  const [timingNotice, setTimingNotice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Phase 5 Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedIncidentId, setSubmittedIncidentId] = useState<string | null>(null);

  // Revoke object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (draft.photoPreviewUrl) {
        URL.revokeObjectURL(draft.photoPreviewUrl);
      }
    };
  }, [draft.photoPreviewUrl]);

  // Handle Photo Capture from either Camera or File Input
  const handlePhotoCaptured = useCallback(
    async (result: CapturedPhotoResult) => {
      // Free previously captured object URL if retaking
      if (draft.photoPreviewUrl) {
        URL.revokeObjectURL(draft.photoPreviewUrl);
      }

      let activeLocation = location;

      // If location is missing or stale (>30s), attempt a fresh fix
      if (!activeLocation || isStale) {
        setTimingNotice('Refreshing GPS coordinates for photo timestamp...');
        activeLocation = await detectLocation();
        setTimingNotice(null);
      }

      setDraft({
        photo: result.file,
        photoPreviewUrl: result.previewUrl,
        capturedAt: result.capturedAt,
        photoConfirmed: false,
        location: activeLocation,
        aiAnalysis: null,
        userCategoryOverride: null,
      });
      setAnalysisError(null);
      setSubmitError(null);
    },
    [draft.photoPreviewUrl, location, isStale, detectLocation]
  );

  // Retake Photo
  const handleRetakePhoto = useCallback(() => {
    if (draft.photoPreviewUrl) {
      URL.revokeObjectURL(draft.photoPreviewUrl);
    }
    setDraft((prev) => ({
      ...prev,
      photo: null,
      photoPreviewUrl: null,
      capturedAt: null,
      photoConfirmed: false,
      aiAnalysis: null,
      userCategoryOverride: null,
    }));
    setAnalysisError(null);
    setSubmitError(null);
  }, [draft.photoPreviewUrl]);

  // Confirm Use Photo
  const handleConfirmPhoto = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      photoConfirmed: true,
    }));
  }, []);

  // Trigger Real Gemini Multimodal Analysis via POST /api/analyze-incident
  const handleAnalyzeImage = useCallback(async () => {
    if (!draft.photo) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('image', draft.photo);

      const response = await fetch('/api/analyze-incident', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg =
          data.error || "CivicEye AI couldn't analyze this photo. Please try again.";
        setAnalysisError(errorMsg);
        return;
      }

      setDraft((prev) => ({
        ...prev,
        aiAnalysis: data.analysis,
      }));
    } catch {
      setAnalysisError(
        'Network error communicating with CivicEye AI service. Please check your connection.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [draft.photo]);

  // User Category Override change handler
  const handleCategoryOverrideChange = useCallback(
    (category: CivicCategory | null) => {
      setDraft((prev) => ({
        ...prev,
        userCategoryOverride: category,
      }));
    },
    []
  );

  // Phase 5: Submit Civic Incident to Cloud Firestore
  const handleSubmitReport = useCallback(async () => {
    if (!currentUser) {
      setSubmitError('You need to sign in before submitting a report.');
      return;
    }

    if (!location) {
      setSubmitError('Location is required to submit a civic report.');
      return;
    }

    if (!draft.aiAnalysis) {
      setSubmitError('Please analyze the photo before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const finalCategory = draft.userCategoryOverride || draft.aiAnalysis.category;
      const isConfirmed =
        !draft.userCategoryOverride ||
        draft.userCategoryOverride === draft.aiAnalysis.category;

      const incidentId = await createIncident({
        reporter: {
          uid: currentUser.uid,
          displayName: currentUser.displayName ?? null,
          email: currentUser.email ?? null,
          photoURL: currentUser.photoURL ?? null,
        },
        category: finalCategory,
        aiAnalysis: draft.aiAnalysis,
        userConfirmation: {
          confirmed: isConfirmed,
          categoryOverride: isConfirmed ? null : draft.userCategoryOverride,
        },
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          capturedAt: location.timestamp,
        },
      });

      setSubmittedIncidentId(incidentId);

      // Phase 7: Trigger server-side AI duplicate detection and priority scoring
      fetch('/api/process-clustering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId }),
      }).catch((clusterErr) => {
        console.warn('[CivicEye Clustering Trigger Warning]:', clusterErr);
      });
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      setSubmitError(
        errorObj.message || 'Something went wrong while submitting your report.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, location, draft.aiAnalysis, draft.userCategoryOverride]);

  // Reset form to report another issue
  const handleResetForm = useCallback(() => {
    if (draft.photoPreviewUrl) {
      URL.revokeObjectURL(draft.photoPreviewUrl);
    }
    setDraft({
      photo: null,
      photoPreviewUrl: null,
      capturedAt: null,
      photoConfirmed: false,
      location: null,
      aiAnalysis: null,
      userCategoryOverride: null,
    });
    setSubmittedIncidentId(null);
    setSubmitError(null);
    setAnalysisError(null);
  }, [draft.photoPreviewUrl]);

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-sm">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  // Auth gate
  if (!currentUser) {
    return (
      <AuthRequiredCard
        title="Sign in to Report Issues"
        description="CivicEye requires verified citizen authentication to submit infrastructure reports."
      />
    );
  }

  // Post-submission success view
  if (submittedIncidentId && draft.aiAnalysis && location) {
    const finalCategory = draft.userCategoryOverride || draft.aiAnalysis.category;
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        <PageHeader
          title="Incident Report Complete"
          description="Your civic hazard has been successfully verified and stored in the municipal dispatch registry."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Report Issue', href: '/report' },
            { label: 'Submission Confirmed' },
          ]}
        />

        <ReportProgress
          hasLocation={true}
          hasPhoto={true}
          hasAnalysis={true}
          hasSubmitted={true}
        />

        <ReportSuccessCard
          incidentId={submittedIncidentId}
          category={finalCategory}
          severity={draft.aiAnalysis.severity}
          hazardLevel={draft.aiAnalysis.hazardLevel}
          location={location}
          onResetForm={handleResetForm}
        />
      </div>
    );
  }

  const hasLocation = Boolean(location);
  const hasPhoto = Boolean(draft.photo);
  const hasAnalysis = Boolean(draft.aiAnalysis);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      <PageHeader
        title="Report a Civic Issue"
        description="Capture real evidence of municipal hazards at the exact scene. Camera capture and browser GPS ensure verified citizen reports."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Phase 5: Real Firestore Incident
          </span>
        }
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Report Issue' },
        ]}
      />

      {/* User Identity Banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 shadow-xs">
        {currentUser.photoURL ? (
          <Image
            src={currentUser.photoURL}
            alt={currentUser.displayName ?? 'Citizen'}
            width={32}
            height={32}
            unoptimized
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full border border-emerald-700/60 shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-emerald-200 font-medium block truncate">
            Reporting as {currentUser.displayName ?? currentUser.email ?? 'Citizen'}
          </span>
          <span className="text-[11px] text-slate-400 block truncate">
            Evidence and GPS coordinates are preserved in client-side memory for verification.
          </span>
        </div>
      </div>

      {/* 4-Step Progress Indicator */}
      <ReportProgress
        hasLocation={hasLocation}
        hasPhoto={hasPhoto}
        hasAnalysis={hasAnalysis}
        hasSubmitted={false}
      />

      {/* Timing Notice Banner */}
      {timingNotice && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-300 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{timingNotice}</span>
        </div>
      )}

      {/* STEP 1: REAL BROWSER GEOLOCATION */}
      <LocationCapture
        location={location}
        loading={geoLoading}
        error={geoError}
        isStale={isStale}
        onRefresh={detectLocation}
      />

      {/* STEP 2: REAL CAMERA / PHOTO CAPTURE */}
      {draft.photo && draft.photoPreviewUrl ? (
        <PhotoPreview
          photo={draft.photo}
          previewUrl={draft.photoPreviewUrl}
          capturedAt={draft.capturedAt ?? 0}
          isConfirmed={draft.photoConfirmed}
          onRetake={handleRetakePhoto}
          onConfirm={handleConfirmPhoto}
        />
      ) : (
        <CameraCapture onPhotoCaptured={handlePhotoCaptured} />
      )}

      {/* Associated Evidence & Location Summary Card (When Both Available) */}
      {draft.photo && draft.location && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-800/50 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Evidence & Location Associated</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px] pt-1">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                GPS: {draft.location.latitude.toFixed(5)}°, {draft.location.longitude.toFixed(5)}° (±{draft.location.accuracy}m)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Captured: {draft.capturedAt ? new Date(draft.capturedAt).toLocaleTimeString() : '--'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REAL GEMINI MULTIMODAL AI DEFECT ANALYSIS */}
      {draft.aiAnalysis ? (
        <AiAnalysisCard
          analysis={draft.aiAnalysis}
          userCategoryOverride={draft.userCategoryOverride}
          onCategoryOverrideChange={handleCategoryOverrideChange}
          onReanalyze={handleAnalyzeImage}
          isAnalyzing={isAnalyzing}
        />
      ) : (
        <Card className="border-slate-800 bg-slate-900/90 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                STEP 3: Multimodal AI Defect Analysis
              </CardTitle>
              {hasPhoto && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Ready for AI
                </span>
              )}
            </div>
            <CardDescription className="text-xs">
              Google Gemini Multimodal Vision will inspect the captured evidence to automatically determine defect category, estimate severity score (1–10), and identify affected commuter groups.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAnalyzing ? (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-emerald-900/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-600/60 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">
                    CivicEye AI is analyzing the image...
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Inspecting road surface, structural integrity, hazard severity, and municipal response requirements using Gemini Vision.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 pt-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing visual neural tokens</span>
                </div>
              </div>
            ) : analysisError ? (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold text-rose-200 block">
                      Analysis Notice
                    </span>
                    <p className="text-rose-300 leading-relaxed">{analysisError}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleAnalyzeImage}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : hasPhoto ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Photograph attached and ready. Click below to run AI visual triage.
                  </span>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  className="w-full shadow-lg shadow-emerald-950/40 font-semibold"
                >
                  Analyze with CivicEye AI
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-500 flex items-center gap-2.5">
                <Info className="w-4 h-4 text-slate-500 shrink-0" />
                <span>
                  Please capture or upload photo evidence in Step 2 above to enable AI defect analysis.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 4: PHASE 5 REAL FIRESTORE INCIDENT CREATION */}
      {draft.aiAnalysis && location ? (
        <ReportSummaryCard
          analysis={draft.aiAnalysis}
          userCategoryOverride={draft.userCategoryOverride}
          location={location}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onSubmit={handleSubmitReport}
        />
      ) : (
        <Card className="border-slate-800 bg-slate-900/60 opacity-80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-400">
                <Send className="w-4 h-4 text-slate-500" />
                STEP 4: Review & Submit Civic Report
              </CardTitle>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Awaiting Steps 1–3
              </span>
            </div>
            <CardDescription className="text-xs">
              Final verification before submitting the incident to the municipal dispatch ledger.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled
              className="w-full opacity-50 cursor-not-allowed"
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Civic Report
            </Button>
            <p className="text-[11px] text-slate-500 text-center">
              Complete Location, Photo Evidence, and AI Analysis above to enable incident submission.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
