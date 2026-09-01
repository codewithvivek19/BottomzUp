#!/usr/bin/env node
/**
 * Hostinger-safe public asset sync.
 *
 * Canonical marketing sources (local monorepo):
 *   <repo>/index.html, <repo>/css, <repo>/js, <repo>/pages, <repo>/assets
 *
 * On Hostinger (Root Directory = web), sibling ../css is often unavailable.
 * Fallback: reuse committed web/public/legacy/* then copy to public/{css,js,pages}.
 *
 * NEVER hand-edit public/legacy or public/{css,js,pages} locally for long —
 * when ../css exists, this script overwrites legacy from the repo root.
 */
import { cpSync, existsSync, lstatSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(webRoot, 'public');
const legacy = join(pub, 'legacy');
const parentRoot = join(webRoot, '..');

function wipe(target) {
  if (!existsSync(target)) return;
  rmSync(target, { recursive: true, force: true });
}

function copyDir(src, dest, label) {
  if (!existsSync(src)) {
    console.error(`[sync-public-assets] missing source: ${src}`);
    process.exit(1);
  }
  wipe(dest);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  const kind = lstatSync(dest).isDirectory() ? 'dir' : 'file';
  console.log(`[sync-public-assets] ${label} (${kind})`);
}

function copyFile(src, dest, label) {
  if (!existsSync(src)) {
    console.error(`[sync-public-assets] missing source: ${src}`);
    process.exit(1);
  }
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest);
  console.log(`[sync-public-assets] ${label} (file)`);
}

function hasMarketingRoot(root) {
  return existsSync(join(root, 'css')) && existsSync(join(root, 'index.html'));
}

function hasLegacyFallback() {
  return existsSync(join(legacy, 'css')) && existsSync(join(legacy, 'index.html'));
}

mkdirSync(legacy, { recursive: true });

const monorepoRoot = hasMarketingRoot(parentRoot) ? parentRoot : null;

if (monorepoRoot) {
  // Local / full-repo Hostinger checkout: refresh legacy from repo root
  copyDir(join(monorepoRoot, 'css'), join(legacy, 'css'), 'legacy/css <- ../css');
  copyDir(join(monorepoRoot, 'js'), join(legacy, 'js'), 'legacy/js <- ../js');
  copyDir(join(monorepoRoot, 'pages'), join(legacy, 'pages'), 'legacy/pages <- ../pages');
  if (existsSync(join(monorepoRoot, 'assets'))) {
    copyDir(join(monorepoRoot, 'assets'), join(legacy, 'assets'), 'legacy/assets <- ../assets');
  }
  copyFile(join(monorepoRoot, 'index.html'), join(legacy, 'index.html'), 'legacy/index.html <- ../index.html');
} else if (hasLegacyFallback()) {
  // Hostinger web-only tree: keep committed public/legacy
  console.warn(
    `[sync-public-assets] ../css not found (looked in ${join(parentRoot, 'css')}). ` +
      'Using committed public/legacy fallback.'
  );
} else {
  console.error('[sync-public-assets] No marketing sources found.');
  console.error(`  missing monorepo: ${join(parentRoot, 'css')}`);
  console.error(`  missing fallback: ${join(legacy, 'css')}`);
  console.error('  Fix: ensure repo-root css/ exists, or commit web/public/legacy/.');
  process.exit(1);
}

writeFileSync(
  join(legacy, 'DO-NOT-EDIT.md'),
  [
    '# Generated / deploy fallback — do not hand-edit',
    '',
    'Prefer editing repo-root `css/`, `js/`, `pages/`, `assets/`, `index.html`.',
    'When those exist, `npm run sync:public` overwrites this folder.',
    'On Hostinger (Root Directory = web), this committed snapshot is the fallback.',
    '',
  ].join('\n')
);

// legacy → public top-level copies (Hostinger-safe /css /js /pages)
for (const name of ['css', 'js', 'pages']) {
  copyDir(join(legacy, name), join(pub, name), `${name} <- legacy/${name}`);
}

console.log('[sync-public-assets] done');
