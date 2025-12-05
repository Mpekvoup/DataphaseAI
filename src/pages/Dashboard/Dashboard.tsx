import { useTranslation } from 'react-i18next';
import {
  Ticket,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Activity
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
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { t } = useTranslation();

  // Демо данные для графиков
  const trendData = [
    { date: '01.12', total: 145, autoResolved: 72, manual: 73 },
    { date: '02.12', total: 168, autoResolved: 85, manual: 83 },
    { date: '03.12', total: 152, autoResolved: 78, manual: 74 },
    { date: '04.12', total: 189, autoResolved: 95, manual: 94 },
    { date: '05.12', total: 175, autoResolved: 88, manual: 87 },
  ];

  const statusData = [
    { name: 'Новые', value: 45, color: '#3b82f6' },
    { name: 'В работе', value: 82, color: '#f59e0b' },
    { name: 'Решенные', value: 156, color: '#10b981' },
    { name: 'Закрытые', value: 234, color: '#6b7280' },
  ];

  const priorityData = [
    { priority: 'Низкий', count: 89 },
    { priority: 'Средний', count: 156 },
    { priority: 'Высокий', count: 67 },
    { priority: 'Срочный', count: 23 },
  ];

  const categoryData = [
    { name: 'Технические', value: 145 },
    { name: 'Финансы', value: 89 },
    { name: 'Доступ', value: 67 },
    { name: 'Общие', value: 56 },
    { name: 'Жалобы', value: 23 },
  ];

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

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={t('dashboard.stats.totalTickets')}
          value="517"
          icon={Ticket}
          change={12}
          trend="up"
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title={t('dashboard.stats.autoResolved')}
          value="258"
          suffix="(49.9%)"
          icon={CheckCircle}
          change={8}
          trend="up"
          colorClass="bg-green-50 text-green-600"
        />
        <StatCard
          title={t('dashboard.stats.avgResponseTime')}
          value="2.3"
          suffix="мин"
          icon={Clock}
          change={-15}
          trend="down"
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title={t('dashboard.stats.slaCompliance')}
          value="96.5"
          suffix="%"
          icon={Target}
          change={3}
          trend="up"
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          title={t('dashboard.stats.activeTickets')}
          value="127"
          icon={Activity}
          change={-5}
          trend="down"
          colorClass="bg-orange-50 text-orange-600"
        />
        <StatCard
          title={t('dashboard.stats.accuracyRate')}
          value="94.2"
          suffix="%"
          icon={TrendingUp}
          change={2}
          trend="up"
          colorClass="bg-cyan-50 text-cyan-600"
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Динамика заявок */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {t('dashboard.charts.ticketsTrend')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Всего"
              />
              <Line
                type="monotone"
                dataKey="autoResolved"
                stroke="#10b981"
                strokeWidth={2}
                name="Авто-решенные"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" name="Заявок" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
