import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

// Get the current app version
const versionFile = fs.readFileSync('./src/version.ts', 'utf-8')
const versionMatch = versionFile.match(/export const APP_VERSION = '([^']+)'/)
const APP_VERSION = versionMatch ? versionMatch[1] : '0.0.0'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to inject version into HTML
    {
      name: 'inject-version',
      transformIndexHtml: {
        order: 'pre',
        handler: (html) => {
          return html.replace(/__APP_VERSION__/g, APP_VERSION)
        }
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'LiftTracker - Workout Tracker',
        short_name: 'LiftTracker',
        description: 'Track your weightlifting workouts, sets, and progress',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cacheId: `lifttracker-v${APP_VERSION}`,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: `google-fonts-v${APP_VERSION}`,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
})
