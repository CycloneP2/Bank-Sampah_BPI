/**
 * Netlify Serverless Function for Backend
 * Wraps Express server for Netlify deployment
 * 
 * This function converts the Express server to work
 * with Netlify's serverless architecture
 */

import { Handler, Context } from '@netlify/functions';
import { createServer, Server } from 'http';
import { app } from '../../src/server';

let server: Server;

/**
 * Handler function for Netlify
 * Converts HTTP request/response to Express format
 */
const handler: Handler = async (event, context) => {
  // Initialize server on first request
  if (!server) {
    server = createServer(app);
  }

  // Convert Netlify event to Node.js HTTP request/response
  return new Promise((resolve) => {
    const req = {
      method: event.httpMethod,
      url: event.path + (event.queryStringParameters ? `?${new URLSearchParams(event.queryStringParameters).toString()}` : ''),
      headers: event.headers,
      body: event.body,
    };

    const res = {
      statusCode: 200,
      headers: {},
      body: '',
    };

    // Handle the request through Express
    server.emit('request', req, res);

    resolve({
      statusCode: res.statusCode,
      headers: res.headers,
      body: res.body,
    });
  });
};

export { handler };
