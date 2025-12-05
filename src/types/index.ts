// Типы для системы ИИ Help Desk

export const TicketStatus = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  AUTO_RESOLVED: 'auto_resolved'
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority];

export const TicketCategory = {
  TECHNICAL: 'technical',
  BILLING: 'billing',
  ACCESS: 'access',
  GENERAL: 'general',
  COMPLAINT: 'complaint',
  FEATURE_REQUEST: 'feature_request'
} as const;

export type TicketCategory = typeof TicketCategory[keyof typeof TicketCategory];

export const TicketChannel = {
  EMAIL: 'email',
  CHAT: 'chat',
  PORTAL: 'portal',
  PHONE: 'phone'
} as const;

export type TicketChannel = typeof TicketChannel[keyof typeof TicketChannel];

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  channel: TicketChannel;
  assignedDepartment?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  autoResolved: boolean;
  aiConfidence: number;
  language: 'ru' | 'kk';
  customerEmail: string;
  customerName: string;
}

export interface DashboardStats {
  totalTickets: number;
  autoResolved: number;
  autoResolvedPercentage: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  accuracyRate: number;
  activeTickets: number;
  slaCompliance: number;
}

export interface TicketsByStatus {
  status: TicketStatus;
  count: number;
}

export interface TicketsByPriority {
  priority: TicketPriority;
  count: number;
}

export interface TicketsByCategory {
  category: TicketCategory;
  count: number;
}

export interface TimeSeriesData {
  date: string;
  total: number;
  autoResolved: number;
  manual: number;
}

export interface DepartmentPerformance {
  department: string;
  avgResolutionTime: number;
  ticketsHandled: number;
  satisfactionRate: number;
}

export interface AIInsight {
  id: string;
  ticketId: string;
  suggestion: string;
  confidence: number;
  appliedAt?: Date;
}
