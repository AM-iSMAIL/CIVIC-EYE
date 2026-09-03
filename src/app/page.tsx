import React from 'react';
import Link from 'next/link';
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
  Layers,
  Map as MapIcon,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

export default function HomePage() {
  const steps = [
    {
      number: '01',
      title: 'Snap & Report',
      description:
        'Citizens take a quick photo of any civic issue. The browser captures high-precision GPS coordinates instantly.',
      icon: <Camera className="w-6 h-6 text-emerald-400" />,
      accent: 'border-emerald-500/20 bg-emerald-950/20',
    },
    {
      number: '02',
      title: 'Gemini AI Vision',
      description:
        'Google Gemini analyzes damage patterns, categorizes the fault (pothole, blocked drain, etc.), and assigns severity ratings.',
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
      accent: 'border-cyan-500/20 bg-cyan-950/20',
    },
    {
      number: '03',
      title: 'Real-Time Dispatch',
      description:
        'Incidents appear on the city map. Municipal teams dispatch work crews and resolve issues with transparent verification.',
      icon: <Truck className="w-6 h-6 text-purple-400" />,
      accent: 'border-purple-500/20 bg-purple-950/20',
    },
  ];

  const features = [
    {
      title: 'AI Detection',
      description:
        'Multimodal vision powered by Google Gemini automatically classifies damage, detects safety hazards, and extracts visual evidence from photos.',
      icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
      tag: 'Gemini Multimodal AI',
      stats: 'Instant Hazard Detection',
    },
    {
      title: 'GPS Location',
      description:
        'Pinpoint geolocation automatically links reported photos to civic coordinates and street addresses for precise municipal dispatch.',
      icon: <MapPin className="w-6 h-6 text-emerald-400" />,
      tag: 'Geospatial Precision',
      stats: 'Sub-meter Accuracy',
    },
    {
      title: 'Smart Prioritization',
      description:
        'AI severity scoring triages dangerous civic conditions like deep potholes or blocked storm drains before they cause accidents or flooding.',
      icon: <ShieldAlert className="w-6 h-6 text-amber-400" />,
      tag: 'Intelligent Triage',
      stats: 'Automated Severity Scoring',
    },
    {
      title: 'Civic Intelligence',
      description:
        'Aggregated city telemetry gives municipality leaders visibility into infrastructure health, repair speed, and neighborhood hotspot trends.',
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      tag: 'City Command Analytics',
      stats: 'Predictive Heatmaps',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Glows & Grid Pattern */}
      <div className="absolute inset-0 civic-grid pointer-events-none opacity-40" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] civic-radar rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Tagline / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner mb-8 text-xs font-medium text-emerald-400">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Urban Intelligence Platform</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-slate-300">Phase 1 Foundation</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Report civic problems.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Let AI understand them.
            </span>{' '}
            Help build a better city.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
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
                leftIcon={<MapIcon className="w-5 h-5 text-cyan-400" />}
              >
                View Civic Map
              </Button>
            </Link>
          </div>

          {/* Value props checklist */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated Defect Rating</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Exact GPS Pinpointing</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Transparent City Dispatch</span>
            </div>
          </div>
        </div>
      </section>

      {/* How CivicEye Works Section */}
      <section className="py-16 sm:py-24 border-t border-slate-800/70 bg-slate-950/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl font-bold text-white mt-2 tracking-tight">
              How CivicEye Works
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              From roadside photo to municipal work order in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-8 hover:border-slate-700 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.accent}`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-700 select-none">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Features Section */}
      <section className="py-20 sm:py-28 border-t border-slate-800/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
              High-Impact Capabilities
            </span>
            <h2 className="text-3xl font-bold text-white mt-2 tracking-tight">
              Next-Gen Urban Intelligence
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3">
              Built on multimodal vision and geospatial coordination to accelerate public works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat) => (
              <Card
                key={feat.title}
                hoverEffect
                className="p-8 border-slate-800/90 bg-slate-900/70"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/60">
                    {feat.icon}
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  {feat.description}
                </p>

                <div className="pt-4 border-t border-slate-800/70 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Core Metric</span>
                  <span className="text-emerald-400 font-semibold">{feat.stats}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Civic Impact Callout */}
      <section className="py-16 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-[#0b0f19]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/70 to-cyan-950/30 p-8 sm:p-12 relative overflow-hidden">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
              Ready to report a civic issue in your neighborhood?
            </h3>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto mb-8">
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
              <Link href="/admin">
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Layers className="w-4 h-4" />}
                >
                  Municipal Command Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
