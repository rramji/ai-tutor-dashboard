// API configuration for different environments

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  STUDENTS: `${API_BASE_URL}/api/students`,
  STUDENT_DETAILS: (id: string) => `${API_BASE_URL}/api/students/${id}`,
  STATS_OVERVIEW: `${API_BASE_URL}/api/stats/overview`,
  STATS_WEEKLY: `${API_BASE_URL}/api/stats/weekly`,
};

export default API_ENDPOINTS;