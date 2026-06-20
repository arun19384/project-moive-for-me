import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Do Young — ดูยัง?',
    short_name: 'Do Young',
    description: 'your watched shelf',
    start_url: '/shelf',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0D0D0D',
    theme_color: '#0D0D0D',
    icons: [
      { src: '/icon', sizes: '192x192', type: 'image/png' },
      { src: '/icon', sizes: '512x512', type: 'image/png' },
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
