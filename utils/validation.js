'use strict';

/**
 * Validates event input data
 * 
 * @param {object} data - Event data to validate
 * @returns {object} Validation result with isValid and message properties
 */
const validateEventInput = (data) => {
  if (!data.name) {
    return { isValid: false, message: 'Event name is required' };
  }
  
  if (!data.date) {
    return { isValid: false, message: 'Event date is required' };
  }
  
  if (!data.location) {
    return { isValid: false, message: 'Event location is required' };
  }
  
  return { isValid: true };
};

/**
 * Validates registration input data
 * 
 * @param {object} data - Registration data to validate
 * @returns {object} Validation result with isValid and message properties
 */
const validateRegistrationInput = (data) => {
  if (!data.attendeeName) {
    return { isValid: false, message: 'Attendee name is required' };
  }
  
  if (!data.email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  // Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  
  return { isValid: true };
};

module.exports = {
  validateEventInput,
  validateRegistrationInput,
};