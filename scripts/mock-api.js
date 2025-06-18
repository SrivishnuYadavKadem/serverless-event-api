'use strict';

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Sample data
const users = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123', // In a real app, this would be hashed
    phone: '555-123-4567'
  }
];

const events = [
  {
    id: '1',
    name: 'Tech Conference 2023',
    description: 'Annual technology conference with speakers from around the world',
    date: '2023-11-15',
    location: 'San Francisco, CA',
    capacity: 500,
    organizer: 'Tech Events Inc',
    createdAt: 1667001600000,
    updatedAt: 1667001600000
  },
  {
    id: '2',
    name: 'Web Development Workshop',
    description: 'Hands-on workshop for modern web development',
    date: '2023-12-05',
    location: 'Online',
    capacity: 100,
    organizer: 'Code Academy',
    createdAt: 1669680000000,
    updatedAt: 1669680000000
  }
];

const registrations = [];

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'serverless-event-api-mock'
  });
});

// List events
app.get('/events', (req, res) => {
  const { search } = req.query;
  
  if (!search) {
    return res.json(events);
  }
  
  // Filter events by name or location
  const searchLower = search.toLowerCase();
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchLower) || 
    event.location.toLowerCase().includes(searchLower) ||
    (event.description && event.description.toLowerCase().includes(searchLower))
  );
  
  res.json(filteredEvents);
});

// Get event by ID
app.get('/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(event);
});

// Get detailed event information
app.get('/events/:id/details', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  
  // Add additional details that wouldn't be in the basic event object
  const eventDetails = {
    ...event,
    agenda: [
      { time: '9:00 AM', title: 'Registration & Breakfast' },
      { time: '10:00 AM', title: 'Keynote Speech' },
      { time: '11:30 AM', title: 'Workshop Sessions' },
      { time: '1:00 PM', title: 'Lunch' },
      { time: '2:00 PM', title: 'Panel Discussion' },
      { time: '4:00 PM', title: 'Networking' }
    ],
    speakers: [
      { name: 'Jane Smith', title: 'CTO, Tech Innovations', bio: 'Expert in AI and machine learning' },
      { name: 'John Doe', title: 'Founder, StartupX', bio: 'Serial entrepreneur with 3 successful exits' }
    ],
    category: event.id === '1' ? 'Technology' : 'Education',
    registrationCount: Math.floor(Math.random() * 50) + 10
  };
  
  res.json(eventDetails);
});

// Create event
app.post('/events', (req, res) => {
  const { name, description, date, location, capacity, organizer } = req.body;
  
  if (!name || !date || !location) {
    return res.status(400).json({ message: 'Missing required fields: name, date, location' });
  }
  
  const newEvent = {
    id: uuidv4(),
    name,
    description: description || '',
    date,
    location,
    capacity: capacity || null,
    organizer: organizer || 'Unknown',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  events.push(newEvent);
  res.status(201).json(newEvent);
});

// Register for event
app.post('/events/:id/register', (req, res) => {
  const eventId = req.params.id;
  const { attendeeName, email, phone } = req.body;
  
  // Check if event exists
  const event = events.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  
  // Validate input
  if (!attendeeName || !email) {
    return res.status(400).json({ message: 'Missing required fields: attendeeName, email' });
  }
  
  // Create registration
  const registration = {
    id: uuidv4(),
    eventId,
    attendeeName,
    email,
    phone: phone || null,
    status: 'CONFIRMED',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  registrations.push(registration);
  res.status(201).json(registration);
});

// List registrations for an event
app.get('/events/:id/registrations', (req, res) => {
  const eventId = req.params.id;
  const eventRegistrations = registrations.filter(r => r.eventId === eventId);
  res.json(eventRegistrations);
});

// Get registrations by email
app.get('/registrations', (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: 'Email parameter is required' });
  }
  
  const userRegistrations = registrations.filter(r => r.email === email);
  
  // Enhance with event details
  const enhancedRegistrations = userRegistrations.map(registration => {
    const event = events.find(e => e.id === registration.eventId);
    return {
      ...registration,
      eventName: event ? event.name : 'Unknown Event',
      eventDate: event ? event.date : 'Unknown Date',
      eventLocation: event ? event.location : 'Unknown Location'
    };
  });
  
  res.json(enhancedRegistrations);
});

// Cancel registration
app.delete('/registrations/:id', (req, res) => {
  const registrationId = req.params.id;
  const index = registrations.findIndex(r => r.id === registrationId);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Registration not found' });
  }
  
  // Remove the registration
  registrations.splice(index, 1);
  
  res.json({ message: 'Registration cancelled successfully' });
});

// User login
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // In a real app, you would generate a JWT token here
  const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64');
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }
  });
});

// User signup
app.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  
  // Check if user already exists
  if (users.some(u => u.email === email)) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }
  
  // Create new user
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password, // In a real app, this would be hashed
    phone: null
  };
  
  users.push(newUser);
  
  // In a real app, you would generate a JWT token here
  const token = Buffer.from(JSON.stringify({ id: newUser.id, email: newUser.email })).toString('base64');
  
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone
    }
  });
});

// Get user profile
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone
  });
});

// Update user profile
app.put('/users/:id', (req, res) => {
  const { name, phone } = req.body;
  const userId = req.params.id;
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Update user
  if (name) users[userIndex].name = name;
  if (phone) users[userIndex].phone = phone;
  
  res.json({
    id: users[userIndex].id,
    name: users[userIndex].name,
    email: users[userIndex].email,
    phone: users[userIndex].phone
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
  console.log('Use this URL in your frontend configuration');
});