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

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Helper method for API calls
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
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
