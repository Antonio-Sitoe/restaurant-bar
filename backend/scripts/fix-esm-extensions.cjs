#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const distDir = path.resolve(__dirname, '..', 'dist');

function isRelativeImport(spec) {
  return spec.startsWith('./') || spec.startsWith('../');
}

function hasJsExtension(spec) {
  return spec.endsWith('.js') || spec.endsWith('.mjs') || spec.includes('?');
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  content = content.replace(
    /(import\s+(?:[^'"]+?\s+from\s+)?|import\s*\()\s*['"]([^'"]+)['"](\))?/g,
    (match, prefix, spec, closing) => {
      if (!isRelativeImport(spec) || hasJsExtension(spec)) return match;
      const fixed = `${prefix}"${spec}.js"${closing || ''}`;
      changed = true;
      return fixed;
    }
  );

  content = content.replace(
    /(export\s+[^'"]+?\s+from\s+)\s*['"]([^'"]+)['"]/g,
    (match, prefix, spec) => {
      if (!isRelativeImport(spec) || hasJsExtension(spec)) return match;
      changed = true;
      return `${prefix}"${spec}.js"`;
    }
  );

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      fixFile(full);
    }
  }
}

walk(distDir);
console.log('Fixed ESM import specifiers in dist to include .js extensions.');


