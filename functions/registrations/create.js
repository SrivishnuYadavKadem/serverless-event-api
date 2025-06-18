'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../../utils/response');
const { validateRegistrationInput } = require('../../utils/validation');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);
    const eventId = event.pathParameters.id;
    
    // Validate input
    const validationResult = validateRegistrationInput(data);
    if (!validationResult.isValid) {
      return error(validationResult.message, 400);
    }

    // Check if event exists
    const eventParams = {
      TableName: process.env.EVENTS_TABLE,
      Key: {
        id: eventId
      }
    };

    const eventResult = await dynamoDb.get(eventParams).promise();

    if (!eventResult.Item) {
      return error('Event not found', 404);
    }

    // Check if event has reached capacity
    if (eventResult.Item.capacity) {
      // Get current registration count
      const countParams = {
        TableName: process.env.REGISTRATIONS_TABLE,
        IndexName: 'EventIdIndex',
        KeyConditionExpression: 'eventId = :eventId',
        ExpressionAttributeValues: {
          ':eventId': eventId
        },
        Select: 'COUNT'
      };

      const countResult = await dynamoDb.query(countParams).promise();
      
      if (countResult.Count >= eventResult.Item.capacity) {
        return error('Event has reached maximum capacity', 400);
      }
    }

    // Create registration
    const registrationParams = {
      TableName: process.env.REGISTRATIONS_TABLE,
      Item: {
        id: uuidv4(),
        eventId: eventId,
        attendeeName: data.attendeeName,
        email: data.email,
        phone: data.phone || null,
        status: 'PENDING',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    await dynamoDb.put(registrationParams).promise();

    return success(registrationParams.Item, 201);
  } catch (err) {
    console.error('Error registering for event:', err);
    return error('Could not register for the event');
  }
};