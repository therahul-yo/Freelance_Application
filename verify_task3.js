import fs from 'fs';
import path from 'path';

const cssPath = path.resolve('frontend/src/App.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const appPath = path.resolve('frontend/src/App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const dashboardPath = path.resolve('frontend/src/pages/Dashboard/index.jsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

const checks = [
  { name: 'laserTrace keyframes', type: 'css', regex: /@keyframes\s+laserTrace\s*\{[^}]*0%\s*\{\s*clip-path:\s*inset\(0 100% 100% 0\);\s*\}/ },
  { name: '.card-laser-wrapper', type: 'css', regex: /\.card-laser-wrapper\s*\{[^}]*position:\s*relative;[^}]*\}/ },
  { name: '.card-laser-border', type: 'css', regex: /\.card-laser-border\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*-2px;[^}]*border:\s*2px solid var\(--color-accent-primary\);[^}]*\}/ },
  { name: '.card:hover .card-laser-border animation', type: 'css', regex: /\.card:hover\s+\.card-laser-border\s*\{[^}]*animation:\s*laserTrace\s+0\.4s\s+linear\s+forwards;[^}]*\}/ },
  { name: 'App.jsx contains card-laser-border', type: 'jsx', content: appContent, regex: /className="card"[\s\S]*?<div\s+className="card-laser-border"\s*\/>/ },
  { name: 'Dashboard contains card-laser-border', type: 'jsx', content: dashboardContent, regex: /className="card"[\s\S]*?<div\s+className="card-laser-border"\s*\/>/ },
];

let failed = false;
checks.forEach(check => {
  const targetContent = check.type === 'css' ? cssContent : check.content;
  if (!check.regex.test(targetContent)) {
    console.error(`FAIL: ${check.name} missing or incorrect`);
    failed = true;
  } else {
    console.log(`PASS: ${check.name}`);
  }
});

if (failed) {
  process.exit(1);
} else {
  console.log('All Task 3 requirements met!');
}
