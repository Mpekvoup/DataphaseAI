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
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { TicketStatus, TicketPriority, TicketChannel } from '../../types';
import type { Ticket } from '../../types';

const Tickets = () => {
  const { t } = useTranslation();

  // Демо данные
  const tickets: Ticket[] = [
    {
      id: 'T-2024-001',
      title: 'Проблема с доступом к личному кабинету',
      description: 'Не могу войти в личный кабинет, пишет неверный пароль',
      status: TicketStatus.NEW,
      priority: TicketPriority.HIGH,
      category: 'access' as any,
      channel: TicketChannel.EMAIL,
      assignedDepartment: 'IT Support',
      createdAt: new Date('2024-12-05T10:30:00'),
      updatedAt: new Date('2024-12-05T10:30:00'),
      autoResolved: false,
      aiConfidence: 0.92,
      language: 'ru',
      customerEmail: 'user@example.com',
      customerName: 'Иванов Иван'
    },
    {
      id: 'T-2024-002',
      title: 'Вопрос по тарифам',
      description: 'Хочу узнать подробнее о корпоративном тарифе',
      status: TicketStatus.AUTO_RESOLVED,
      priority: TicketPriority.LOW,
      category: 'billing' as any,
      channel: TicketChannel.CHAT,
      createdAt: new Date('2024-12-05T09:15:00'),
      updatedAt: new Date('2024-12-05T09:20:00'),
      resolvedAt: new Date('2024-12-05T09:20:00'),
      autoResolved: true,
      aiConfidence: 0.98,
      language: 'ru',
      customerEmail: 'client@example.kz',
      customerName: 'Петрова Анна'
    },
    {
      id: 'T-2024-003',
      title: 'Техническая неисправность',
      description: 'Не загружается страница отчетов',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.URGENT,
      category: 'technical' as any,
      channel: TicketChannel.PORTAL,
      assignedDepartment: 'Tech Team',
      assignedTo: 'Сидоров А.',
      createdAt: new Date('2024-12-05T08:45:00'),
      updatedAt: new Date('2024-12-05T11:00:00'),
      autoResolved: false,
      aiConfidence: 0.87,
      language: 'ru',
      customerEmail: 'admin@company.kz',
      customerName: 'Смирнов Петр'
    }
  ];

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
      </div>
    </div>
  );
};

export default Tickets;
