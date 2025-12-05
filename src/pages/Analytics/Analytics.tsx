import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Radar
} from 'recharts';

const Analytics = () => {
  const { t } = useTranslation();

  // Демо данные для аналитики
  const resolutionTrendData = [
    { month: 'Июль', avgTime: 45, tickets: 450 },
    { month: 'Август', avgTime: 42, tickets: 520 },
    { month: 'Сентябрь', avgTime: 38, tickets: 580 },
    { month: 'Октябрь', avgTime: 35, tickets: 610 },
    { month: 'Ноябрь', avgTime: 28, tickets: 670 },
    { month: 'Декабрь', avgTime: 25, tickets: 720 },
  ];

  const departmentData = [
    {
      department: 'IT Support',
      avgResolutionTime: 23,
      ticketsHandled: 234,
      satisfactionRate: 4.5
    },
    {
      department: 'Tech Team',
      avgResolutionTime: 45,
      ticketsHandled: 156,
      satisfactionRate: 4.7
    },
    {
      department: 'Billing',
      avgResolutionTime: 15,
      ticketsHandled: 189,
      satisfactionRate: 4.3
    },
    {
      department: 'Customer Success',
      avgResolutionTime: 18,
      ticketsHandled: 98,
      satisfactionRate: 4.6
    }
  ];

  const channelDistribution = [
    { channel: 'Email', count: 245, autoResolved: 120 },
    { channel: 'Чат', count: 189, autoResolved: 95 },
    { channel: 'Портал', count: 156, autoResolved: 78 },
    { channel: 'Телефон', count: 89, autoResolved: 15 }
  ];

  const aiPerformance = [
    { metric: 'Точность', value: 94 },
    { metric: 'Скорость', value: 98 },
    { metric: 'Удовлетворенность', value: 89 },
    { metric: 'Автоматизация', value: 92 },
    { metric: 'SLA', value: 96 }
  ];

  const hourlyDistribution = [
    { hour: '00:00', tickets: 12 },
    { hour: '03:00', tickets: 8 },
    { hour: '06:00', tickets: 15 },
    { hour: '09:00', tickets: 45 },
    { hour: '12:00', tickets: 67 },
    { hour: '15:00', tickets: 58 },
    { hour: '18:00', tickets: 42 },
    { hour: '21:00', tickets: 28 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('analytics.title')}
        </h1>
        <p className="text-gray-600">
          Детальная аналитика и отчеты по работе системы
        </p>
      </div>

      {/* Фильтры периода */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            {t('analytics.timeRange')}:
          </label>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Последние 7 дней</option>
            <option>Последние 30 дней</option>
            <option>Последние 3 месяца</option>
            <option>Последний год</option>
            <option>Произвольный период</option>
          </select>
        </div>
      </div>

      {/* Динамика решений */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {t('analytics.resolutionTrend')}
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={resolutionTrendData}>
            <defs>
              <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="avgTime"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorTime)"
              name="Среднее время (мин)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="tickets"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorTickets)"
              name="Количество заявок"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Производительность отделов */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {t('analytics.departmentPerformance')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="department" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgResolutionTime" fill="#f59e0b" name="Время (мин)" />
              <Bar dataKey="ticketsHandled" fill="#0ea5e9" name="Заявок" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Распределение по каналам */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            {t('analytics.channelDistribution')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="Всего" />
              <Bar dataKey="autoResolved" fill="#10b981" name="Авто-решено" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Производительность ИИ */}
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

        {/* Почасовое распределение */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Почасовое распределение заявок
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Заявок"
                dot={{ fill: '#f59e0b', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Таблица детальной статистики */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Детальная статистика по отделам
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Отдел
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Среднее время решения
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Обработано заявок
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Удовлетворенность
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departmentData.map((dept) => (
                <tr key={dept.department} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {dept.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {dept.avgResolutionTime} мин
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {dept.ticketsHandled}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < Math.floor(dept.satisfactionRate) ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {dept.satisfactionRate}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Отлично
                    </span>
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

export default Analytics;
