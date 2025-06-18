'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const params = {
      TableName: process.env.EVENTS_TABLE,
      Key: {
        id: event.pathParameters.id
      },
      ReturnValues: 'ALL_OLD'
    };

    const result = await dynamoDb.delete(params).promise();

    if (!result.Attributes) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Event not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Event deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting event:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ message: 'Could not delete the event' }),
    };
  }
};