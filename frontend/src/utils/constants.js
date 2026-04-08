// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
  },
  EMERGENCY: {
    BASE: '/emergency',
    ALERTS: '/emergency/alerts',
  },
  CHATBOT: {
    BASE: '/chatbot',
    MESSAGE: '/chatbot/message',
  },
};

// User roles
export const USER_ROLES = {
  DONOR: 'donor',
};

// Blood types
export const BLOOD_TYPES = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];


