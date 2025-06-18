'use strict';

const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();
const config = require('../../config');

module.exports.handler = async (event) => {
  try {
    // Process each record from the DynamoDB stream
    for (const record of event.Records) {
      // Only process new registrations
      if (record.eventName !== 'INSERT') {
        continue;
      }

      const registration = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
      
      // Get event details
      const eventParams = {
        TableName: config.tables.events,
        Key: {
          id: registration.eventId
        }
      };

      const eventResult = await dynamoDb.get(eventParams).promise();
      const eventDetails = eventResult.Item;

      if (!eventDetails) {
        console.error(`Event ${registration.eventId} not found`);
        continue;
      }

      // Send confirmation email
      const emailParams = {
        Source: config.email.from,
        Destination: {
          ToAddresses: [registration.email]
        },
        Message: {
          Subject: {
            Data: `Registration Confirmation: ${eventDetails.name}`
          },
          Body: {
            Text: {
              Data: `
Hello ${registration.attendeeName},

Thank you for registering for ${eventDetails.name}!

Event Details:
- Date: ${eventDetails.date}
- Location: ${eventDetails.location}
- Description: ${eventDetails.description}

Your registration is confirmed. We look forward to seeing you there!

Best regards,
The Event Team
              `
            },
            Html: {
              Data: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; border: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Registration Confirmed</h1>
    </div>
    <div class="content">
      <p>Hello ${registration.attendeeName},</p>
      <p>Thank you for registering for <strong>${eventDetails.name}</strong>!</p>
      
      <h2>Event Details:</h2>
      <ul>
        <li><strong>Date:</strong> ${eventDetails.date}</li>
        <li><strong>Location:</strong> ${eventDetails.location}</li>
        <li><strong>Description:</strong> ${eventDetails.description}</li>
      </ul>
      
      <p>Your registration is confirmed. We look forward to seeing you there!</p>
      
      <p>Best regards,<br>The Event Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
              `
            }
          }
        }
      };

      // Send the email via SES
      try {
        await ses.sendEmail(emailParams).promise();
        console.log(`Email sent to ${registration.email}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${registration.email}:`, emailError);
        // Continue processing even if email fails
      }

      // Update registration status
      const updateParams = {
        TableName: config.tables.registrations,
        Key: {
          id: registration.id
        },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'CONFIRMED',
          ':updatedAt': new Date().getTime()
        }
      };

      await dynamoDb.update(updateParams).promise();
      console.log(`Registration ${registration.id} confirmed`);
    }

    return { processed: event.Records.length };
  } catch (error) {
    console.error('Error processing registrations:', error);
    throw error;
  }
};