import fs from 'fs';
import path from 'path';

const cssPath = path.resolve('frontend/src/index.css');
const content = fs.readFileSync(cssPath, 'utf8');

const checks = [
  { name: '--color-bg-primary', regex: /--color-bg-primary:\s*#0B0D0F/ },
  { name: '--color-bg-secondary', regex: /--color-bg-secondary:\s*#16191D/ },
  { name: '--color-grid', regex: /--color-grid:\s*#1A1E23/ },
  { name: '--color-accent-primary', regex: /--color-accent-primary:\s*#FF6B00/ },
  { name: '--color-accent-secondary', regex: /--color-accent-secondary:\s*#1E2A3B/ },
  { name: '--color-text-primary', regex: /--color-text-primary:\s*#F0F0F0/ },
  { name: '--color-text-secondary', regex: /--color-text-secondary:\s*#808A9D/ },
  { name: '--color-border', regex: /--color-border:\s*#1E2A3B/ },
  { name: '--color-border-active', regex: /--color-border-active:\s*#FF6B00/ },
  { name: '--radius-none', regex: /--radius-none:\s*0px/ },
  { name: '--spacing-grid', regex: /--spacing-grid:\s*32px/ },
  { name: 'body background-image', regex: /background-image:\s*linear-gradient\(to right, var\(--color-grid\) 1px, transparent 1px\),\s*linear-gradient\(to bottom, var\(--color-grid\) 1px, transparent 1px\)/ },
  { name: 'body background-size', regex: /background-size:\s*var\(--spacing-grid\) var\(--spacing-grid\)/ },
  { name: 'universal border-radius', regex: /\*\s*\{[^}]*border-radius:\s*var\(--radius-none\) !important;/ },
  { name: '.card border', regex: /\.card\s*\{[^}]*border:\s*2px solid var\(--color-border\);/ },
  { name: '.card background', regex: /\.card\s*\{[^}]*background:\s*var\(--color-bg-secondary\);/ },
  { name: '.card box-shadow', regex: /\.card\s*\{[^}]*box-shadow:\s*4px 4px 0px 0px #000000;/ },
  { name: '.card:hover', regex: /\.card:hover\s*\{[^}]*border-color:\s*var\(--color-border-active\);/ },
];

let failed = false;
checks.forEach(check => {
  if (!check.regex.test(content)) {
    console.error(`FAIL: ${check.name} missing or incorrect`);
    failed = true;
  } else {
    console.log(`PASS: ${check.name}`);
  }
});

if (failed) {
  process.exit(1);
} else {
  console.log('All Task 1 requirements met!');
}
