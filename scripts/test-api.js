'use strict';

const https = require('https');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get API endpoint from command line arguments or prompt user
let apiEndpoint = process.argv[2];

function promptForEndpoint() {
  return new Promise((resolve) => {
    if (apiEndpoint) {
      resolve(apiEndpoint);
      return;
    }
    
    rl.question('Enter your API Gateway endpoint URL: ', (answer) => {
      apiEndpoint = answer.trim();
      resolve(apiEndpoint);
    });
  });
}

// Make HTTP request
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, apiEndpoint);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test health endpoint
async function testHealth() {
  console.log('\n--- Testing Health Endpoint ---');
  try {
    const response = await makeRequest('/health');
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.body, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test creating an event
async function testCreateEvent() {
  console.log('\n--- Testing Create Event ---');
  console.log('Note: This requires IAM authentication');
  
  const eventData = {
    name: 'Test Event',
    description: 'This is a test event created by the API test script',
    date: new Date().toISOString().split('T')[0],
    location: 'Virtual',
    capacity: 100,
    organizer: 'Test Script'
  };
  
  try {
    const response = await makeRequest('/events', 'POST', eventData);
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', JSON.stringify(response.body, null, 2));
    return response.body.id;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Test listing events
async function testListEvents() {
  console.log('\n--- Testing List Events ---');
  try {
    const response = await makeRequest('/events');
    console.log(`Status: ${response.statusCode}`);
    console.log(`Found ${response.body.length} events`);
    
    if (response.body.length > 0) {
      console.log('First event:', JSON.stringify(response.body[0], null, 2));
    }
    
    return response.body;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

// Run all tests
async function runTests() {
  await promptForEndpoint();
  
  if (!apiEndpoint) {
    console.error('API endpoint is required');
    rl.close();
    return;
  }
  
  console.log(`Testing API at: ${apiEndpoint}`);
  
  await testHealth();
  await testListEvents();
  
  rl.close();
}

runTests().catch(console.error);