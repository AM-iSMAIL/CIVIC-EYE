import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { CivicEyeLogo } from '@/components/splash/CivicEyeLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white text-slate-500 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <CivicEyeLogo size={28} />
              <span className="text-base font-black text-slate-950 tracking-tight">
                CIVIC<span className="text-blue-600">EYE</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Powered by Google Gemini AI & Google Maps Platform
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              {siteConfig.citizenNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Civic Priorities */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5">
              Civic Channels
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Potholes & Road Safety</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Drainage & Flood Mitigation</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sanitation & Illegal Dumping</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CivicEye Platform. Built for Autonomous Urban Intelligence.</p>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Verified Municipal Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
