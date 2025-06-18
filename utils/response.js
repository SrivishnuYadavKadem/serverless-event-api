'use strict';

/**
 * Creates a standardized API response
 * 
 * @param {number} statusCode - HTTP status code
 * @param {object|string} body - Response body
 * @returns {object} Formatted response object
 */
const formatResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
};

/**
 * Creates a success response
 * 
 * @param {object|string} body - Response body
 * @param {number} statusCode - HTTP status code (defaults to 200)
 * @returns {object} Formatted success response
 */
const success = (body, statusCode = 200) => {
  return formatResponse(statusCode, body);
};

/**
 * Creates an error response
 * 
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (defaults to 500)
 * @returns {object} Formatted error response
 */
const error = (message, statusCode = 500) => {
  return formatResponse(statusCode, { message });
};

module.exports = {
  formatResponse,
  success,
  error,
};