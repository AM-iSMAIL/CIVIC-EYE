import type { CivicCategory, HazardLevel } from './analysis';
import type { IssueStatus } from './incident';

export type MapCategoryFilter = CivicCategory | 'all';
export type MapSeverityFilter = HazardLevel | 'all';
export type MapStatusFilter = IssueStatus | 'all';

export interface MapViewport {
  lat: number;
  lng: number;
  zoom: number;
}
