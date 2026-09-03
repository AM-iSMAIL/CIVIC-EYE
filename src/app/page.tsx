'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  MapPin,
  ShieldAlert,
  BarChart3,
  Camera,
  Cpu,
  Truck,
  ArrowRight,
  CheckCircle2,
  Eye,
  Map as MapIcon,
  Play,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { CivicEyeSplashScreen } from '@/components/splash/CivicEyeSplashScreen';

export default function HomePage() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenSplash = sessionStorage.getItem('civiceye_splash_viewed');
      setShowSplash(!hasSeenSplash);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('civiceye_splash_viewed', 'true');
    setShowSplash(false);
    router.push('/login');
  };

  const replaySplash = () => {
    setShowSplash(true);
  };

  const steps = [
    {
      number: '01',
      title: 'Snap & Report',
      description:
        'Citizens take a quick photo of any civic issue. The browser captures high-precision GPS coordinates instantly.',
      icon: <Camera className="w-5 h-5 text-blue-600" />,
      accent: 'border-blue-100 bg-blue-50/80',
    },
    {
      number: '02',
      title: 'Gemini AI Vision',
      description:
        'Google Gemini analyzes damage patterns, categorizes the fault (pothole, blocked drain, etc.), and assigns severity ratings.',
      icon: <Cpu className="w-5 h-5 text-emerald-600" />,
      accent: 'border-emerald-100 bg-emerald-50/80',
    },
    {
      number: '03',
      title: 'Real-Time Dispatch',
      description:
        'Incidents appear on the city map. Municipal teams dispatch work crews and resolve issues with transparent verification.',
      icon: <Truck className="w-5 h-5 text-indigo-600" />,
      accent: 'border-indigo-100 bg-indigo-50/80',
    },
  ];

  const features = [
    {
      title: 'AI Detection',
      description:
        'Multimodal vision powered by Google Gemini automatically classifies damage, detects safety hazards, and extracts visual evidence from photos.',
      icon: <Sparkles className="w-5 h-5 text-blue-600" />,
      tag: 'Gemini Multimodal AI',
      stats: 'Instant Hazard Rating',
    },
    {
      title: 'GPS Location',
      description:
        'Pinpoint geolocation automatically links reported photos to civic coordinates and street addresses for precise municipal dispatch.',
      icon: <MapPin className="w-5 h-5 text-emerald-600" />,
      tag: 'Geospatial Precision',
      stats: 'Sub-meter Accuracy',
    },
    {
      title: 'Smart Prioritization',
      description:
        'AI severity scoring triages dangerous civic conditions like deep potholes or blocked storm drains before they cause accidents or flooding.',
      icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
      tag: 'Intelligent Triage',
      stats: 'Automated Scoring',
    },
    {
      title: 'Civic Intelligence',
      description:
        'Aggregated city telemetry gives municipality leaders visibility into infrastructure health, repair speed, and neighborhood hotspot trends.',
      icon: <BarChart3 className="w-5 h-5 text-purple-600" />,
      tag: 'City Command Analytics',
      stats: 'Predictive Heatmaps',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-[#fbfcfd]">
      {/* 1. CivicEye Splash Screen */}
      {showSplash === true && (
        <CivicEyeSplashScreen onComplete={handleSplashComplete} />
      )}

      {/* Background Precision Grid */}
      <div className="absolute inset-0 civic-grid pointer-events-none opacity-60" />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tagline / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm mb-8 text-xs font-semibold text-slate-700">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Urban Intelligence Platform</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <button
              onClick={replaySplash}
              className="text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
              title="Replay AI splash screen"
            >
              <Play className="w-2.5 h-2.5" />
              <span>Intro</span>
            </button>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.15]">
            Report civic problems.{' '}
            <span className="text-blue-600">
              Let AI understand them.
            </span>{' '}
            Help build a better city.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            CivicEye bridges citizens and city administrators. Photograph potholes,
            overflowing garbage, or damaged utilities—our visual AI automatically analyzes
            and prioritizes repairs for safer neighborhoods.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/report" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8"
                leftIcon={<Camera className="w-5 h-5" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Report an Issue
              </Button>
            </Link>

            <Link href="/map" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8"
                leftIcon={<MapIcon className="w-5 h-5 text-blue-600" />}
              >
                View Civic Map
              </Button>
            </Link>

            <Link href="/my-reports" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-8"
                leftIcon={<FileText className="w-4 h-4 text-slate-600" />}
              >
                My Reports
              </Button>
            </Link>
          </div>

          {/* Value props checklist */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto font-medium">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Automated Defect Rating</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Exact GPS Pinpointing</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Transparent City Dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* How CivicEye Works Section */}
      <section className="py-16 sm:py-24 border-t border-slate-200/80 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 mt-2 tracking-tight">
              How CivicEye Works
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              From roadside photo to municipal work order in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${step.accent}`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-300 select-none">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Features Section */}
      <section className="py-20 sm:py-28 border-t border-slate-200/80 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              High-Impact Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 mt-2 tracking-tight">
              Next-Gen Urban Intelligence
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Built on multimodal vision and geospatial coordination to accelerate public works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat) => (
              <Card
                key={feat.title}
                hoverEffect
                className="p-8"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    {feat.icon}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-950 mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  {feat.description}
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Core Metric</span>
                  <span className="text-emerald-600 font-bold">{feat.stats}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Civic Impact Callout */}
      <section className="py-16 border-t border-slate-200/80 bg-slate-50/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-blue-200/80 bg-white p-8 sm:p-12 relative overflow-hidden shadow-sm">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-3 tracking-tight">
              Ready to report a civic issue in your neighborhood?
            </h3>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
              Every verified report helps city crews fix hazards faster and prevents
              infrastructure decay.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/report">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Camera className="w-4 h-4" />}
                >
                  Start Reporting
                </Button>
              </Link>
              <Link href="/map">
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<MapIcon className="w-4 h-4 text-blue-600" />}
                >
                  Explore Civic Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
