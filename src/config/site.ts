export interface NavItem {
  title: string;
  href: string;
  description: string;
  badge?: string;
}

export const siteConfig = {
  name: 'CivicEye',
  tagline: 'Report civic problems. Let AI understand them. Help build a better city.',
  description:
    'An AI-powered civic issue reporting and city intelligence platform. Seamlessly connect citizens and municipal departments through automated visual AI and real-time geospatial dispatch.',
  navItems: [
    {
      title: 'Home',
      href: '/',
      description: 'CivicEye Overview and Mission',
    },
    {
      title: 'Report Issue',
      href: '/report',
      description: 'Photograph & submit civic problems',
    },
    {
      title: 'Civic Map',
      href: '/map',
      description: 'Explore live city-wide incidents',
    },
    {
      title: 'Admin Hub',
      href: '/admin',
      description: 'Municipal command center & telemetry',
    },
  ] satisfies NavItem[],
  categories: [
    {
      id: 'pothole',
      label: 'Potholes & Roads',
      description: 'Potholes, surface cracks, road hazards',
      iconName: 'AlertTriangle',
    },
    {
      id: 'garbage',
      label: 'Garbage & Waste',
      description: 'Overflowing bins, illegal dumping, debris',
      iconName: 'Trash2',
    },
    {
      id: 'blocked_drain',
      label: 'Blocked Drains',
      description: 'Clogged storm drains, standing water, flooding',
      iconName: 'Droplets',
    },
    {
      id: 'streetlight',
      label: 'Broken Streetlights',
      description: 'Dark roads, flickering or broken lamps',
      iconName: 'Lightbulb',
    },
    {
      id: 'fallen_tree',
      label: 'Fallen Trees',
      description: 'Fallen branches, obstructed walkways or power lines',
      iconName: 'Trees',
    },
    {
      id: 'water_leak',
      label: 'Water Pipeline Leaks',
      description: 'Burst municipal pipes, excessive water wastage',
      iconName: 'Activity',
    },
    {
      id: 'other',
      label: 'Other Civic Issues',
      description: 'General municipal maintenance issues',
      iconName: 'HelpCircle',
    },
  ] as const,
  severities: [
    { id: 'low', label: 'Low', color: 'slate', desc: 'Minor cosmetic issue' },
    { id: 'medium', label: 'Medium', color: 'amber', desc: 'Moderate public nuisance' },
    { id: 'high', label: 'High', color: 'orange', desc: 'Significant hazard' },
    { id: 'critical', label: 'Critical', color: 'rose', desc: 'Immediate danger to safety' },
  ] as const,
  statuses: [
    { id: 'submitted', label: 'Submitted', color: 'slate' },
    { id: 'analyzing', label: 'AI Analyzing', color: 'blue' },
    { id: 'in_review', label: 'In Review', color: 'amber' },
    { id: 'in_progress', label: 'In Progress', color: 'purple' },
    { id: 'resolved', label: 'Resolved', color: 'emerald' },
  ] as const,
};
