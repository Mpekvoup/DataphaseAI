import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, Download, TrendingUp, Clock } from 'lucide-react';

const MyAnalytics = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7days');

  // Демо данные для личных запросов
  const myTicketsData = [
    { date: '01.12', submitted: 3, resolved: 2, pending: 1 },
    { date: '02.12', submitted: 5, resolved: 4, pending: 1 },
    { date: '03.12', submitted: 2, resolved: 2, pending: 0 },
    { date: '04.12', submitted: 4, resolved: 3, pending: 1 },
    { date: '05.12', submitted: 6, resolved: 5, pending: 1 },
  ];

  const myStats = {
    totalSubmitted: 20,
    resolved: 16,
    pending: 3,
    closed: 1,
    avgResponseTime: 2.5,
    satisfactionRate: 4.6
  };

  const ticketsByStatus = [
    { name: 'Решенные', value: 16, color: '#10b981' },
    { name: 'В работе', value: 3, color: '#f59e0b' },
    { name: 'Закрытые', value: 1, color: '#6b7280' },
  ];

  const recentTickets = [
    { id: 'T-2024-001', title: 'Проблема с доступом', status: 'resolved', daysAgo: 2 },
    { id: 'T-2024-005', title: 'Вопрос по услуге', status: 'pending', daysAgo: 1 },
    { id: 'T-2024-008', title: 'Техническая ошибка', status: 'in_progress', daysAgo: 0 },
  ];

  const categoryBreakdown = [
    { category: 'Технические', count: 8 },
    { category: 'Финансы', count: 7 },
    { category: 'Доступ', count: 3 },
    { category: 'Общие', count: 2 },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: string } = {
      resolved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('myAnalytics.title')}
        </h1>
        <p className="text-gray-600">
          Анализ ваших запросов и истории взаимодействий
        </p>
      </div>

      {/* Фильтры */}
      <div className="card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-600" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7days">Последние 7 дней</option>
              <option value="30days">Последние 30 дней</option>
              <option value="90days">Последние 3 месяца</option>
              <option value="all">Все время</option>
            </select>
          </div>
          <button className="ml-auto flex items-center gap-2 btn-secondary">
            <Download size={18} />
            Скачать отчет
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Всего запросов</p>
              <p className="text-3xl font-bold text-gray-900">{myStats.totalSubmitted}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Решено</p>
              <p className="text-3xl font-bold text-green-600">{myStats.resolved}</p>
              <p className="text-xs text-gray-500 mt-1">{((myStats.resolved / myStats.totalSubmitted) * 100).toFixed(0)}%</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">В процессе</p>
              <p className="text-3xl font-bold text-amber-600">{myStats.pending}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Среднее время ответа</p>
              <p className="text-3xl font-bold text-purple-600">{myStats.avgResponseTime}</p>
              <p className="text-xs text-gray-500 mt-1">мин</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Вкладки */}
      <div className="card">
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          {['overview', 'timeline', 'categories'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' && 'Обзор'}
              {tab === 'timeline' && 'Динамика'}
              {tab === 'categories' && 'По категориям'}
            </button>
          ))}
        </div>

        {/* Обзор */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Распределение по статусам</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ticketsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ticketsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Недавние запросы</h3>
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ticket.id}</p>
                      <p className="text-sm text-gray-600">{ticket.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ticket.status)}`}>
                        {ticket.status === 'resolved' && 'Решено'}
                        {ticket.status === 'pending' && 'В ожидании'}
                        {ticket.status === 'in_progress' && 'В работе'}
                      </span>
                      <span className="text-xs text-gray-500">{ticket.daysAgo}д назад</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Динамика */}
        {activeTab === 'timeline' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Динамика запросов</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={myTicketsData}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="submitted"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorSubmitted)"
                  name="Отправлено"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  name="Решено"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* По категориям */}
        {activeTab === 'categories' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Запросы по категориям</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0ea5e9" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAnalytics;
