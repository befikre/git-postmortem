#!/usr/bin/env node
const { execSync } = require('child_process');

const prompt = process.argv.slice(2).join(' ').trim();

if (!prompt) {
  console.log('usage: git-pm "<incident description>"');
  process.exit(1);
}

if (process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
}

try {
  execSync(`gitclaw --dir "${__dirname}" "${prompt}"`, { stdio: 'inherit' });
} catch (err) {
  if (err.message?.includes('not recognized') || err.message?.includes('not found')) {
    console.error('\nOops! You need to install gitclaw first: npm i -g gitclaw\n');
  }
  process.exit(1);
}
