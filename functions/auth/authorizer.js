'use strict';

/**
 * Custom authorizer for API Gateway
 * This is a simple implementation that could be expanded to use JWT tokens
 * or integrate with Amazon Cognito in a production environment
 */
module.exports.handler = async (event) => {
  try {
    // Get the authorization token from the request
    const token = event.authorizationToken;
    
    // In a real implementation, you would validate the token
    // For this example, we'll use a simple API key check
    const apiKey = process.env.API_KEY;
    
    // Check if the token is valid
    const effect = token === `Bearer ${apiKey}` ? 'Allow' : 'Deny';
    
    // Return the policy document
    return generatePolicy('user', effect, event.methodArn);
  } catch (error) {
    console.error('Error in authorizer:', error);
    throw new Error('Unauthorized');
  }
};

/**
 * Generate an IAM policy document
 */
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {
    principalId
  };
  
  if (effect && resource) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    };
    
    authResponse.policyDocument = policyDocument;
  }
  
  // Optional context values
  authResponse.context = {
    userId: principalId,
    // Add additional context values as needed
  };
  
  return authResponse;
};