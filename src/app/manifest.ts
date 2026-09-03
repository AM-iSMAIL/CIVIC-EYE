import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CivicEye - AI Urban Intelligence',
    short_name: 'CivicEye',
    description: 'Civic issue reporting, multimodal AI verification, and municipal triage platform.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fbfcfd',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
