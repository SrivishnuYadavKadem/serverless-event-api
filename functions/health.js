'use strict';

const { success } = require('../utils/response');

/**
 * Health check endpoint
 * Used for monitoring the API's health
 */
module.exports.handler = async () => {
  return success({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'serverless-event-api'
  });
};