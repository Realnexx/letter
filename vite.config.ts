import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({plugins: [react(), tailwindcss()], build:{rollupOptions:{input:{main:fileURLToPath(new URL('./index.html',import.meta.url)),card:fileURLToPath(new URL('./gift-card.html',import.meta.url))}}}});
