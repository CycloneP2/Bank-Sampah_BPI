/**
 * Vercel Serverless Function Handler
 * Exports Express app to be handled by Vercel
 */

import '../dist/server.js';
export { default } from '../dist/server.js';
