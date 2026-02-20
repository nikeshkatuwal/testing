// Determine the base URL based on the environment
const isDevelopment = import.meta.env.MODE === 'development';

// In development, use the current hostname (useful for mobile testing). In production, use relative URL
export const BASE_API_URL = isDevelopment
  ? `http://${window.location.hostname}:8001/api/v1`
  : "/api/v1";

export const USER_API_END_POINT = `${BASE_API_URL}/user`;
export const JOB_API_END_POINT = `${BASE_API_URL}/job`;
export const APPLICATION_API_END_POINT = `${BASE_API_URL}/application`;
export const COMPANY_API_END_POINT = `${BASE_API_URL}/company`;
export const NOTIFICATION_API_END_POINT = `${BASE_API_URL}/notification`;
