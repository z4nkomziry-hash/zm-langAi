#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const required = [
  'index.html', 'app.js', 'auth.js', 'server.js', 'db.js', 'config.js',
  'ai-utils.js', 'subscription-policy.js', 'learning-policy.js',
  'review-scheduler.js', 'daily-learning.js', '.env.example', 'package-lock.json'
];
const errors = [];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required file: ${file}`);
}
if (fs.existsSync(path.join(root, '.env'))) errors.push('A real .env file must not be included in a release ZIP.');

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (!packageJson.scripts?.start || !packageJson.scripts?.test) errors.push('package.json must define start and test scripts.');

const sourceFiles = ['app.js', 'auth.js', 'server.js', 'db.js', 'config.js', 'ai-utils.js', 'subscription-policy.js', 'learning-policy.js', 'review-scheduler.js', 'daily-learning.js'];
for (const file of sourceFiles) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], { encoding: 'utf8' });
  if (result.status !== 0) errors.push(`Syntax check failed for ${file}: ${(result.stderr || result.stdout || '').trim()}`);
}

// Detect common accidental secret material in shipped source files.
const scanFiles = [...sourceFiles, 'index.html', '.env.example'];
const secretPatterns = [
  /AIza[0-9A-Za-z_-]{30,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /sk-[A-Za-z0-9]{30,}/
];
for (const file of scanFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf8');
  if (secretPatterns.some(pattern => pattern.test(content))) errors.push(`Possible embedded secret found in ${file}.`);
}

if (errors.length) {
  console.error('Ziman AI release verification FAILED:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Syntax and release-file checks passed (${sourceFiles.length} JavaScript files checked).`);
const tests = spawnSync(process.execPath, ['--test', 'test/*.test.js'], { cwd: root, encoding: 'utf8', shell: true, stdio: 'inherit' });
if (tests.status !== 0) process.exit(tests.status || 1);
console.log('Ziman AI release verification PASSED. Live database/provider checks are not part of this offline verification.');
