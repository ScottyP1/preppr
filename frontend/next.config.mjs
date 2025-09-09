/** @type {import('next').NextConfig} */
const path = import("path")
// ES Module (e.g., app.mjs or "type": "module" in package.json)
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current module's URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // turbopack: {
    // root: join(__dirname, "..")
  // }
};
export default nextConfig;
