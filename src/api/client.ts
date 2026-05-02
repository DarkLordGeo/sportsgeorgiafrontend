import { API_ROUTES } from "./routes";

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}


export const apiClient = {
  getEvents: async (filters?: Record<string, string>): Promise<PaginatedResponse<any>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }
    const queryString = params.toString();
    const url = queryString ? `${API_ROUTES.events}?${queryString}` : API_ROUTES.events;
    return fetchJson<PaginatedResponse<any>>(url);
  },
  
  getEvent: async (id: number | string): Promise<any> => {
    return fetchJson<any>(API_ROUTES.eventById(id));
  },
  
  getSports: async (): Promise<PaginatedResponse<any>> => {
    return fetchJson<PaginatedResponse<any>>(API_ROUTES.sports);
  },
  
  getOrganizations: async (): Promise<PaginatedResponse<any>> => {
    return fetchJson<PaginatedResponse<any>>(API_ROUTES.organizations);
  }
};
