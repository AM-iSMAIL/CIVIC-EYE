import { IssueCategory, IssueSeverity, IssueStatus } from './incident';

export interface IncidentFilterOptions {
  category?: IssueCategory | 'all';
  severity?: IssueSeverity | 'all';
  status?: IssueStatus | 'all';
  searchQuery?: string;
  ward?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface KpiSummary {
  totalReports: number;
  criticalIssues: number;
  pendingResolution: number;
  resolvedCount: number;
  avgResolutionTimeHours?: number;
}
