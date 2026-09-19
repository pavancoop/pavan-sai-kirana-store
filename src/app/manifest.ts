import { MetadataRoute } from 'next';
import { storeConfig } from '@/config/store';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: storeConfig.name,
    short_name: storeConfig.shortName || 'Store',
    description: storeConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF2D7',
    theme_color: '#F98866',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  };
}
