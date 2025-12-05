import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Loader2, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';

const Analytics = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-primary-600" size={48} />
        <span className="ml-3 text-gray-600 text-lg">Загрузка аналитики...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="text-red-600" size={48} />
        <p className="mt-4 text-red-600 font-medium">{error || 'Нет данных'}</p>
        <button onClick={loadStats} className="mt-4 btn-primary">
          Попробовать снова
        </button>
      </div>
    );
  }

  // Подготовка данных из реальной статистики
  const departmentData = Object.entries(stats.by_category || {}).map(([category, count]) => ({
    department: category === 'technical' ? 'Tech Team' :
                category === 'billing' ? 'Billing' :
                category === 'access' ? 'IT Support' :
                category === 'general' ? 'Customer Success' : category,
    ticketsHandled: count as number,
    category: category
  }));

  const channelDistribution = [
    { channel: 'Email', count: 0, autoResolved: 0 },
    { channel: 'Telegram', count: 0, autoResolved: 0 },
    { channel: 'Портал', count: 0, autoResolved: 0 },
    { channel: 'Телефон', count: 0, autoResolved: 0 }
  ];

  const aiPerformance = [
    {
      metric: 'Автоматизация',
      value: Math.round(stats.auto_resolved_percentage || 0)
    },
    {
      metric: 'Точность',
      value: stats.total_tickets > 0 ? Math.round((stats.auto_resolved / stats.total_tickets) * 100) : 0
    },
    {
      metric: 'Эффективность',
      value: stats.active_tickets > 0 ? Math.round(((stats.total_tickets - stats.active_tickets) / stats.total_tickets) * 100) : 0
    }
  ];

  const statusDistribution = Object.entries(stats.by_status || {}).map(([status, count]) => ({
    name: status === 'new' ? 'Новые' :
          status === 'in_progress' ? 'В работе' :
          status === 'auto_resolved' ? 'Авто-решенные' :
          status === 'resolved' ? 'Решенные' :
          status === 'closed' ? 'Закрытые' : status,
    value: count as number,
    color: status === 'new' ? '#3b82f6' :
           status === 'in_progress' ? '#f59e0b' :
           status === 'auto_resolved' ? '#10b981' :
           status === 'resolved' ? '#22c55e' :
           status === 'closed' ? '#6b7280' : '#8b5cf6'
  })).filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('analytics.title')}
        </h1>
        <p className="text-gray-600">
          Детальная аналитика на основе реальных данных
        </p>
      </div>

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Всего тикетов</p>
          <p className="text-3xl font-bold text-primary-600">{stats.total_tickets || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Авто-решено</p>
          <p className="text-3xl font-bold text-green-600">{stats.auto_resolved || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.auto_resolved_percentage?.toFixed(1)}%</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Активных</p>
          <p className="text-3xl font-bold text-orange-600">{stats.active_tickets || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Категорий</p>
          <p className="text-3xl font-bold text-blue-600">{Object.keys(stats.by_category || {}).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Распределение по категориям */}
        {departmentData.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Распределение по категориям
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="department" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="ticketsHandled" fill="#0ea5e9" name="Заявок" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Распределение по статусам */}
        {statusDistribution.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Распределение по статусам
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Производительность ИИ */}
        {aiPerformance.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Производительность ИИ
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={aiPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Показатели"
                  dataKey="value"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Распределение по приоритетам */}
        {Object.keys(stats.by_priority || {}).length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Распределение по приоритетам
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(stats.by_priority || {}).map(([priority, count]) => ({
                  priority: priority === 'low' ? 'Низкий' :
                           priority === 'medium' ? 'Средний' :
                           priority === 'high' ? 'Высокий' :
                           priority === 'urgent' ? 'Срочный' : priority,
                  count: count as number
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Таблица детальной статистики */}
      {departmentData.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Детальная статистика по категориям
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Обработано заявок
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Процент от общего
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentData.map((dept) => (
                  <tr key={dept.category} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {dept.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {dept.ticketsHandled}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {stats.total_tickets > 0
                        ? ((dept.ticketsHandled / stats.total_tickets) * 100).toFixed(1)
                        : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Сообщение если нет данных */}
      {stats.total_tickets === 0 && (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="text-gray-400" size={48} />
            <p className="mt-4 text-gray-600 font-medium">Нет данных для аналитики</p>
            <p className="text-sm text-gray-500 mt-2">
              Данные появятся после обработки первых тикетов
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
