// API service for backend integration
const API_BASE_URL = 'http://localhost:8000';

export interface Ticket {
  id: number;
  ticket_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  channel: string;
  assigned_department?: string;
  assigned_to?: string;
  customer_name: string;
  customer_email: string;
  ai_confidence: number;
  auto_resolved: boolean;
  ai_response?: string;
  language: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface TicketCreate {
  title: string;
  description: string;
  customer_name: string;
  customer_email: string;
  channel?: string;
  language?: string;
}

export interface Stats {
  total_tickets: number;
  auto_resolved: number;
  auto_resolved_percentage: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  active_tickets: number;
}

export interface KnowledgeBaseEntry {
  question: string;
  answer: string;
  category: string;
  distance?: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  telegram_id?: string;
  telegram_username?: string;
  created_at: string;
  last_login?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Helper method for API calls
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Tickets API

  async createTicket(ticket: TicketCreate): Promise<any> {
    return this.request('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  async getTickets(params?: {
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tickets: Ticket[]; count: number }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.request(`/api/tickets${query ? `?${query}` : ''}`);
  }

  async getTicket(ticketId: string): Promise<Ticket> {
    return this.request(`/api/tickets/${ticketId}`);
  }

  // Stats API

  async getStats(): Promise<Stats> {
    return this.request('/api/stats');
  }

  // Knowledge Base API

  async searchKnowledgeBase(
    query: string,
    category?: string,
    language: string = 'ru'
  ): Promise<{ results: KnowledgeBaseEntry[] }> {
    const params = new URLSearchParams({
      query,
      language,
    });
    if (category) params.append('category', category);

    return this.request(`/api/knowledge-base/search?${params}`);
  }

  async addKnowledgeBaseEntry(entry: {
    question: string;
    answer: string;
    category: string;
    language?: string;
  }): Promise<{ id: string; message: string }> {
    return this.request('/api/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  // AI API

  async classifyText(
    title: string,
    description: string,
    language: string = 'ru'
  ): Promise<{
    category: string;
    priority: string;
    department: string;
    confidence: number;
  }> {
    const params = new URLSearchParams({ title, description, language });
    return this.request(`/api/ai/classify?${params}`, {
      method: 'POST',
    });
  }

  async generateResponse(
    description: string,
    category: string,
    language: string = 'ru'
  ): Promise<{
    response: string;
    can_auto_resolve: boolean;
    confidence: number;
  }> {
    const params = new URLSearchParams({ description, category, language });
    return this.request(`/api/ai/generate-response?${params}`, {
      method: 'POST',
    });
  }

  // Authentication API

  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token
    this.setToken(response.access_token);

    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store token
    this.setToken(response.access_token);

    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/api/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  // Health check

  async healthCheck(): Promise<{
    status: string;
    telegram_bot: boolean;
    email_service: boolean;
    knowledge_base: { total_entries: number; collection_name: string };
  }> {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Explicit type exports for better module resolution
export type { User, AuthResponse, LoginData, RegisterData };
