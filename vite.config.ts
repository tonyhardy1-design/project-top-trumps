import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { networkInterfaces } from 'node:os';

/**
 * First non internal IPv4 address, used so the start screen QR code
 * generated on the development machine points phones at an address they
 * can reach rather than localhost. Deployed builds use the real origin.
 */
function lanOrigin(port = 5173): string | null {
  for (const interfaces of Object.values(networkInterfaces())) {
    for (const net of interfaces ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        return `http://${net.address}:${port}`;
      }
    }
  }
  return null;
}

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works at any hosting path,
  // including a GitHub Pages project URL.
  base: './',
  // Listen on all interfaces so phones on the same network can reach the
  // dev server directly during an event.
  server: { host: true },
  define: {
    __LAN_ORIGIN__: JSON.stringify(lanOrigin()),
  },
});
