import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Ticket,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Users,
  Zap,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { apiService } from '../../services/api';

const Dashboard = () => {
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
        <span className="ml-3 text-gray-600 text-lg">Загрузка статистики...</span>
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

  // Подготовка данных для графиков из реальной статистики
  const statusData = [
    {
      name: 'Новые',
      value: stats.by_status?.new || 0,
      color: '#3b82f6'
    },
    {
      name: 'В работе',
      value: stats.by_status?.in_progress || 0,
      color: '#f59e0b'
    },
    {
      name: 'Авто-решенные',
      value: stats.by_status?.auto_resolved || 0,
      color: '#10b981'
    },
    {
      name: 'Решенные',
      value: stats.by_status?.resolved || 0,
      color: '#22c55e'
    },
    {
      name: 'Закрытые',
      value: stats.by_status?.closed || 0,
      color: '#6b7280'
    },
  ].filter(item => item.value > 0);

  const priorityData = [
    { priority: 'Низкий', count: stats.by_priority?.low || 0 },
    { priority: 'Средний', count: stats.by_priority?.medium || 0 },
    { priority: 'Высокий', count: stats.by_priority?.high || 0 },
    { priority: 'Срочный', count: stats.by_priority?.urgent || 0 },
  ].filter(item => item.count > 0);

  const categoryData = Object.entries(stats.by_category || {}).map(([name, value]) => ({
    name: name === 'technical' ? 'Технические' :
          name === 'billing' ? 'Финансы' :
          name === 'access' ? 'Доступ' :
          name === 'general' ? 'Общие' :
          name === 'complaint' ? 'Жалобы' :
          name === 'feature_request' ? 'Запросы функций' : name,
    value: value as number
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-600">
          Обзор производительности системы и основные метрики
        </p>
      </div>

      {/* Основная статистика - 2 ряда */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.stats.totalTickets')}
          value={stats.total_tickets?.toString() || '0'}
          icon={Ticket}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title={t('dashboard.stats.autoResolved')}
          value={stats.auto_resolved?.toString() || '0'}
          suffix={`(${stats.auto_resolved_percentage?.toFixed(1) || '0'}%)`}
          icon={CheckCircle}
          colorClass="bg-green-50 text-green-600"
        />
        <StatCard
          title={t('dashboard.stats.avgResponseTime')}
          value="-"
          suffix="мин"
          icon={Clock}
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title={t('dashboard.stats.slaCompliance')}
          value="-"
          suffix="%"
          icon={Target}
          colorClass="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.stats.activeTickets')}
          value={stats.active_tickets?.toString() || '0'}
          icon={Activity}
          colorClass="bg-orange-50 text-orange-600"
        />
        <StatCard
          title={t('dashboard.stats.accuracyRate')}
          value="-"
          suffix="%"
          icon={Award}
          colorClass="bg-cyan-50 text-cyan-600"
        />
        <StatCard
          title="Всего категорий"
          value={Object.keys(stats.by_category || {}).length.toString()}
          icon={Users}
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Эффективность авто-решения"
          value={stats.auto_resolved_percentage?.toFixed(1) || '0'}
          suffix="%"
          icon={Zap}
          colorClass="bg-yellow-50 text-yellow-600"
        />
      </div>

      {/* Основные графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Распределение по статусам */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {t('dashboard.charts.byStatus')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
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
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* По приоритетам */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {t('dashboard.charts.byPriority')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" name="Количество" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* По категориям */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {t('dashboard.charts.byCategory')}
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" name="Заявок" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500">Нет данных</p>
            </div>
          )}
        </div>
      </div>

      {/* Сводная таблица */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Сводная информация</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Всего обработано</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total_tickets || 0}</p>
            <p className="text-xs text-gray-600 mt-2">всего тикетов</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Авто-решено</p>
            <p className="text-3xl font-bold text-green-600">{stats.auto_resolved || 0}</p>
            <p className="text-xs text-gray-600 mt-2">{stats.auto_resolved_percentage?.toFixed(1) || 0}% успешность</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Активных</p>
            <p className="text-3xl font-bold text-orange-600">{stats.active_tickets || 0}</p>
            <p className="text-xs text-gray-600 mt-2">в работе сейчас</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Категорий</p>
            <p className="text-3xl font-bold text-purple-600">{Object.keys(stats.by_category || {}).length}</p>
            <p className="text-xs text-gray-600 mt-2">типов обращений</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
