import { useTranslation } from 'react-i18next';
import {
  Ticket,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Users,
  Zap,
  Award
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

  const performanceData = [
    { hour: '00:00', resolved: 12, pending: 8 },
    { hour: '04:00', resolved: 15, pending: 6 },
    { hour: '08:00', resolved: 28, pending: 12 },
    { hour: '12:00', resolved: 35, pending: 18 },
    { hour: '16:00', resolved: 32, pending: 16 },
    { hour: '20:00', resolved: 25, pending: 14 },
    { hour: '23:59', resolved: 18, pending: 10 },
  ];

  const agentStats = [
    { name: 'Агент 1', resolved: 45, avg_time: 2.1 },
    { name: 'Агент 2', resolved: 52, avg_time: 1.9 },
    { name: 'Агент 3', resolved: 38, avg_time: 2.5 },
    { name: 'Агент 4', resolved: 41, avg_time: 2.3 },
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

      {/* Основная статистика - 2 ряда */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          icon={Award}
          change={2}
          trend="up"
          colorClass="bg-cyan-50 text-cyan-600"
        />
        <StatCard
          title="Активные агенты"
          value="4"
          icon={Users}
          change={0}
          trend="neutral"
          colorClass="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Эффективность"
          value="92.8"
          suffix="%"
          icon={Zap}
          change={5}
          trend="up"
          colorClass="bg-yellow-50 text-yellow-600"
        />
      </div>

      {/* Основные графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Динамика заявок */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {t('dashboard.charts.ticketsTrend')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Всего"
              />
              <Line
                type="monotone"
                dataKey="autoResolved"
                stroke="#10b981"
                strokeWidth={2}
                name="Авто-решенные"
              />
            </AreaChart>
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

        {/* Производительность по часам */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Производительность (24ч)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="#10b981"
                strokeWidth={2}
                name="Решено"
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#f59e0b"
                strokeWidth={2}
                name="В ожидании"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Статистика агентов */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Топ агентов
          </h3>
          <div className="space-y-3">
            {agentStats.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{agent.name}</p>
                  <p className="text-xs text-gray-600">Среднее: {agent.avg_time} мин</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{agent.resolved}</p>
                  <p className="text-xs text-gray-600">решено</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Сводная таблица */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Сводная информация</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Всего обработано</p>
            <p className="text-3xl font-bold text-blue-600">517</p>
            <p className="text-xs text-gray-600 mt-2">заявок в декабре</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Успешно решено</p>
            <p className="text-3xl font-bold text-green-600">390</p>
            <p className="text-xs text-gray-600 mt-2">75.4% успешность</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Среднее время</p>
            <p className="text-3xl font-bold text-orange-600">2.3</p>
            <p className="text-xs text-gray-600 mt-2">мин на заявку</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Удовлетворение</p>
            <p className="text-3xl font-bold text-purple-600">4.8</p>
            <p className="text-xs text-gray-600 mt-2">из 5 звезд</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
