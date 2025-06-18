'use strict';

/**
 * Application configuration
 */
const config = {
  // DynamoDB tables
  tables: {
    events: process.env.EVENTS_TABLE,
    registrations: process.env.REGISTRATIONS_TABLE
  },
  
  // Email settings
  email: {
    from: process.env.EMAIL_FROM || 'events@yourdomain.com',
    region: process.env.AWS_REGION || 'us-east-1'
  },
  
  // API settings
  api: {
    corsHeaders: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    }
  }
};

module.exports = config;