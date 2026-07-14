// Zero-config Vercel Node.js entry point.
// Vercel auto-detects any file under /api as a serverless function —
// no vercel.json "builds"/@vercel/node config needed, which sidesteps
// the legacy builds+routes pipeline that was failing to deploy.
// The real app lives in ../server.js so Replit's `node server.js` and
// this file both run the exact same Express app.
module.exports = require('../server.js');
