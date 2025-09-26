/* eslint-disable no-console */
// Wrapper to allow `npx run build` to work by invoking Next.js programmatic build

const nextBuild = require('next/dist/build').default;

// Prevent next-pwa from generating sw/workbox files during watched builds
process.env.SKIP_PWA = '1';

(async () => {
  try {
    console.log('[run:build] Starting Next.js production build...');
    console.log('[run:build] Environment overrides: SKIP_PWA=1');
    await nextBuild(process.cwd());
    console.log('[run:build] Build completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[run:build] Build failed:', err);
    process.exit(1);
  }
})();
