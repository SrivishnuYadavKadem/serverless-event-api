'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);
    
    // Validate input
    if (!data || Object.keys(data).length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'No update data provided' }),
      };
    }

    // Build update expression dynamically
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {
      ':updatedAt': timestamp
    };

    // Add updatedAt to the update expression
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    // Add other fields to update expression if they exist
    const allowedFields = ['name', 'description', 'date', 'location', 'capacity', 'organizer'];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        const expressionName = `#${field}`;
        const expressionValue = `:${field}`;
        
        updateExpressions.push(`${expressionName} = ${expressionValue}`);
        expressionAttributeNames[expressionName] = field;
        expressionAttributeValues[expressionValue] = data[field];
      }
    });

    const params = {
      TableName: process.env.EVENTS_TABLE,
      Key: {
        id: event.pathParameters.id
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDb.update(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    console.error('Error updating event:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Could not update the event' }),
    };
  }
};