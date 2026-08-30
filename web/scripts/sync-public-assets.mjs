#!/usr/bin/env node
/**
 * Single source of truth sync for Hostinger / Next.
 *
 * CANONICAL marketing site (edit ONLY these):
 *   <repo>/index.html
 *   <repo>/css/
 *   <repo>/js/
 *   <repo>/pages/
 *   <repo>/assets/
 *
 * Next serves from web/public. This script always:
 *   1) Copies repo-root → web/public/legacy/  (what rewrites point at)
 *   2) Copies legacy/{css,js,pages} → web/public/{css,js,pages}
 *      so /css and /js work without relying on rewrites alone
 *
 * NEVER hand-edit web/public/legacy or web/public/{css,js,pages}.
 * They are overwritten on every predev / prebuild / postinstall.
 */
import { cpSync, existsSync, lstatSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(webRoot, '..');
const pub = join(webRoot, 'public');
const legacy = join(pub, 'legacy');

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

mkdirSync(legacy, { recursive: true });

// 1) Repo root → public/legacy (canonical → what Next rewrites serve)
copyDir(join(repoRoot, 'css'), join(legacy, 'css'), 'legacy/css <- ../../css');
copyDir(join(repoRoot, 'js'), join(legacy, 'js'), 'legacy/js <- ../../js');
copyDir(join(repoRoot, 'pages'), join(legacy, 'pages'), 'legacy/pages <- ../../pages');
if (existsSync(join(repoRoot, 'assets'))) {
  copyDir(join(repoRoot, 'assets'), join(legacy, 'assets'), 'legacy/assets <- ../../assets');
}
copyFile(join(repoRoot, 'index.html'), join(legacy, 'index.html'), 'legacy/index.html <- ../../index.html');

writeFileSync(
  join(legacy, 'DO-NOT-EDIT.md'),
  [
    '# Generated — do not edit',
    '',
    'This folder is overwritten from the **repo root** on every',
    '`npm run sync:public` / `predev` / `prebuild` / `postinstall`.',
    '',
    'Edit only:',
    '- `/index.html`',
    '- `/css/`',
    '- `/js/`',
    '- `/pages/`',
    '- `/assets/`',
    '',
  ].join('\n'),
);

// 2) legacy → public top-level copies (Hostinger-safe /css /js /pages)
for (const name of ['css', 'js', 'pages']) {
  copyDir(join(legacy, name), join(pub, name), `${name} <- legacy/${name}`);
}

console.log('[sync-public-assets] done — single source: repo root');
