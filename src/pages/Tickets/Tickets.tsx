import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Plus,
  Mail,
  MessageSquare,
  Globe as Portal,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { TicketStatus, TicketPriority, TicketChannel } from '../../types';
import type { Ticket } from '../../types';
import { apiService } from '../../services/api';

const Tickets = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка тикетов из API
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getTickets({ limit: 100 });

      // Преобразуем данные из API в формат компонента
      const transformedTickets: Ticket[] = response.tickets.map((ticket: any) => {
        // Преобразование статуса: new -> NEW, auto_resolved -> AUTO_RESOLVED
        const statusMap: Record<string, TicketStatus> = {
          'new': TicketStatus.NEW,
          'in_progress': TicketStatus.IN_PROGRESS,
          'resolved': TicketStatus.RESOLVED,
          'auto_resolved': TicketStatus.AUTO_RESOLVED,
          'closed': TicketStatus.CLOSED
        };

        // Преобразование канала: email -> EMAIL, telegram -> TELEGRAM
        const channelMap: Record<string, TicketChannel> = {
          'email': TicketChannel.EMAIL,
          'telegram': TicketChannel.CHAT,
          'chat': TicketChannel.CHAT,
          'portal': TicketChannel.PORTAL,
          'phone': TicketChannel.PHONE
        };

        return {
          id: ticket.ticket_id,
          title: ticket.title,
          description: ticket.description,
          status: statusMap[ticket.status] || TicketStatus.NEW,
          priority: ticket.priority.toUpperCase() as TicketPriority,
          category: ticket.category as any,
          channel: channelMap[ticket.channel] || TicketChannel.EMAIL,
          assignedDepartment: ticket.assigned_department,
          assignedTo: ticket.assigned_to,
          createdAt: new Date(ticket.created_at),
          updatedAt: new Date(ticket.updated_at),
          resolvedAt: ticket.resolved_at ? new Date(ticket.resolved_at) : undefined,
          autoResolved: ticket.auto_resolved,
          aiConfidence: ticket.ai_confidence,
          language: ticket.language,
          customerEmail: ticket.customer_email,
          customerName: ticket.customer_name
        };
      });

      setTickets(transformedTickets);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Не удалось загрузить тикеты');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.NEW:
        return <AlertCircle className="text-blue-600" size={20} />;
      case TicketStatus.IN_PROGRESS:
        return <Clock className="text-amber-600" size={20} />;
      case TicketStatus.RESOLVED:
      case TicketStatus.AUTO_RESOLVED:
        return <CheckCircle className="text-green-600" size={20} />;
      case TicketStatus.CLOSED:
        return <XCircle className="text-gray-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getChannelIcon = (channel: TicketChannel) => {
    switch (channel) {
      case TicketChannel.EMAIL:
        return <Mail size={16} />;
      case TicketChannel.CHAT:
        return <MessageSquare size={16} />;
      case TicketChannel.PORTAL:
        return <Portal size={16} />;
      case TicketChannel.PHONE:
        return <Phone size={16} />;
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.LOW:
        return 'bg-gray-100 text-gray-800';
      case TicketPriority.MEDIUM:
        return 'bg-blue-100 text-blue-800';
      case TicketPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case TicketPriority.URGENT:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.NEW:
        return 'bg-blue-100 text-blue-800';
      case TicketStatus.IN_PROGRESS:
        return 'bg-amber-100 text-amber-800';
      case TicketStatus.RESOLVED:
      case TicketStatus.AUTO_RESOLVED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('tickets.title')}
          </h1>
          <p className="text-gray-600">
            Управление заявками и обращениями клиентов
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          {t('tickets.new')}
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder={t('tickets.search')}
              className="w-full pl-10 pr-4 py-2 sticky left-0 z-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={20} />
            {t('tickets.filters')}
          </button>
        </div>
      </div>

      {/* Таблица заявок */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary-600" size={40} />
            <span className="ml-3 text-gray-600">Загрузка тикетов...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="text-red-600" size={48} />
            <p className="mt-4 text-red-600 font-medium">{error}</p>
            <button
              onClick={loadTickets}
              className="mt-4 btn-primary"
            >
              Попробовать снова
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="text-gray-400" size={48} />
            <p className="mt-4 text-gray-600">Нет тикетов</p>
            <p className="text-sm text-gray-500">Тикеты появятся здесь после создания обращений</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заявка
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Приоритет
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Канал
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ИИ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Создана
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => console.log('Selected ticket:', ticket.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span className="text-sm font-medium text-gray-900">
                        {ticket.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {ticket.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ticket.customerName}</div>
                    <div className="text-sm text-gray-500">{ticket.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                      {t(`tickets.status.${ticket.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {t(`tickets.priority.${ticket.priority}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-gray-600">
                      {getChannelIcon(ticket.channel)}
                      <span className="text-sm">{t(`tickets.channel.${ticket.channel}`)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${ticket.aiConfidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {(ticket.aiConfidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(ticket.createdAt, 'dd.MM.yyyy HH:mm')}
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;
