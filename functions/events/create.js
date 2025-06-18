'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../../utils/response');
const { validateEventInput } = require('../../utils/validation');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);
    
    // Validate input
    const validationResult = validateEventInput(data);
    if (!validationResult.isValid) {
      return error(validationResult.message, 400);
    }

    const params = {
      TableName: process.env.EVENTS_TABLE,
      Item: {
        id: uuidv4(),
        name: data.name,
        description: data.description || '',
        date: data.date,
        location: data.location,
        capacity: data.capacity || null,
        organizer: data.organizer || 'Unknown',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    await dynamoDb.put(params).promise();

    return success(params.Item, 201);
  } catch (error) {
    console.error('Error creating event:', error);
    return error('Could not create the event');
  }
};