import React from 'react';
import { IncidentReport, IssueCategory } from '@/types/incident';
import { StatusBadge } from './StatusBadge';
import {
  AlertTriangle,
  Trash2,
  Droplets,
  Lightbulb,
  Trees,
  Activity,
  HelpCircle,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

export interface IncidentCardProps {
  incident: IncidentReport;
  onClick?: () => void;
  className?: string;
}

export const getCategoryIcon = (category: IssueCategory) => {
  const iconProps = { className: 'w-4 h-4' };
  switch (category) {
    case 'pothole':
      return <AlertTriangle {...iconProps} className="w-4 h-4 text-amber-400" />;
    case 'garbage':
      return <Trash2 {...iconProps} className="w-4 h-4 text-emerald-400" />;
    case 'blocked_drain':
      return <Droplets {...iconProps} className="w-4 h-4 text-cyan-400" />;
    case 'streetlight':
      return <Lightbulb {...iconProps} className="w-4 h-4 text-yellow-400" />;
    case 'fallen_tree':
      return <Trees {...iconProps} className="w-4 h-4 text-lime-400" />;
    case 'water_leak':
      return <Activity {...iconProps} className="w-4 h-4 text-blue-400" />;
    default:
      return <HelpCircle {...iconProps} className="w-4 h-4 text-slate-400" />;
  }
};

export const formatCategoryName = (category: IssueCategory): string => {
  switch (category) {
    case 'pothole':
      return 'Pothole & Road Defect';
    case 'garbage':
      return 'Garbage Dumping';
    case 'blocked_drain':
      return 'Blocked Storm Drain';
    case 'streetlight':
      return 'Broken Streetlight';
    case 'fallen_tree':
      return 'Fallen Tree / Hazard';
    case 'water_leak':
      return 'Water Main Leak';
    default:
      return 'Civic Issue';
  }
};

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`group bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 transition-all duration-200 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            {getCategoryIcon(incident.category)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {incident.title || formatCategoryName(incident.category)}
            </h4>
            <span className="text-xs text-slate-400 font-mono">ID: #{incident.id.slice(0, 8)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge type="status" value={incident.status} size="sm" />
          <StatusBadge type="severity" value={incident.severity} size="sm" />
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
        {incident.description}
      </p>

      {incident.aiAnalysis && (
        <div className="flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">
            Gemini AI: {incident.aiAnalysis.rationale || 'Verified civic defect'}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {incident.location.address ||
              (incident.location.coordinates
                ? `${incident.location.coordinates.latitude.toFixed(4)}, ${incident.location.coordinates.longitude.toFixed(4)}`
                : 'GPS Location Pending')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{incident.createdAt || 'Recent'}</span>
        </div>
      </div>
    </div>
  );
};
