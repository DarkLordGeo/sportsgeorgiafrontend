const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sports-schedule-backend.onrender.com";

export const API_ROUTES = {
  health: `${VITE_API_BASE_URL}/health/`,
  sports: `${VITE_API_BASE_URL}/api/sports/`,
  organizations: `${VITE_API_BASE_URL}/api/organizations/`,
  events: `${VITE_API_BASE_URL}/api/events/`,
  eventById: (id: number | string) => `${VITE_API_BASE_URL}/api/events/${id}/`,
};
