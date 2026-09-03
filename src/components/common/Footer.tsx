import React from 'react';
import Link from 'next/link';
import { Eye, Shield, Sparkles, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[5px] flex items-center justify-center">
                  <Eye className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Civic<span className="text-emerald-400">Eye</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Powered by Google Gemini AI & Google Maps Platform
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              {siteConfig.citizenNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Civic Priorities */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Civic Channels
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Potholes & Road Safety</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>Drainage & Flood Mitigation</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Sanitation & Illegal Dumping</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CivicEye Initiative. Built for Civic Impact.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Phase 1 Frontend Prototype</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
