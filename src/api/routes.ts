const API_BASE_URL = "https://sports-schedule-backend.onrender.com";

export const API_ROUTES = {
  health: `${API_BASE_URL}/health/`,
  sports: `${API_BASE_URL}/api/sports/`,
  organizations: `${API_BASE_URL}/api/organizations/`,
  events: `${API_BASE_URL}/api/events/`,
  eventById: (id: number | string) => `${API_BASE_URL}/api/events/${id}/`,
  eventsFiltered: (params: URLSearchParams) =>
    `${API_BASE_URL}/api/events/?${params.toString()}`,
};
