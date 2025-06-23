import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png'
      ],
      manifest: {
        name: 'TicTac War',
        short_name: 'TicTac War',
        description: 'A classic Tic Tac Toe game built with React.Js that allows users to play in two modes.',
        theme_color: '#ffffff',
        background_color: 'white',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'Tictactoe192png.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'Tictactoe512png.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'Tictactoe512png.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});