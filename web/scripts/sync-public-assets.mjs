#!/usr/bin/env node
/**
 * Hostinger-safe public asset sync.
 *
 * Legacy HTML requests /css/*, /js/*, /pages/* (via ./css or ../css from /menu etc).
 * Sources live under public/legacy/. Symlinks often break on Hostinger deploys,
 * so we copy real directories into public/ before build.
 */
import { cpSync, existsSync, lstatSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const legacy = join(pub, 'legacy');

const pairs = [
  ['css', join(legacy, 'css')],
  ['js', join(legacy, 'js')],
  ['pages', join(legacy, 'pages')],
];

function wipe(target) {
  if (!existsSync(target)) return;
  rmSync(target, { recursive: true, force: true });
}

for (const [name, src] of pairs) {
  if (!existsSync(src)) {
    console.error(`[sync-public-assets] missing source: ${src}`);
    process.exit(1);
  }
  const dest = join(pub, name);
  wipe(dest);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  const kind = lstatSync(dest).isDirectory() ? 'dir' : 'file';
  console.log(`[sync-public-assets] ${name} <- legacy/${name} (${kind})`);
}

console.log('[sync-public-assets] done');
