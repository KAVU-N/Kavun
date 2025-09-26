/* eslint-disable no-console */
// Wrapper to allow `npx run dev` to work by invoking Next.js dev server

const { spawn } = require('child_process');
const path = require('path');

// Ensure dev env and disable PWA during run-based dev to avoid watcher loops
process.env.NODE_ENV = 'development';
process.env.SKIP_PWA = '1';

const nextBin = path.resolve(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');

console.log('[run:dev] Starting Next.js dev server...');
console.log('[run:dev] Environment overrides: NODE_ENV=development, SKIP_PWA=1');

const child = spawn(process.execPath, [nextBin, 'dev'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  console.log(`[run:dev] Next dev process exited with code ${code}`);
  process.exit(code ?? 0);
});
