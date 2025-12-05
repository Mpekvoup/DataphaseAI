import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  colorClass?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  suffix = '',
  trend = 'neutral',
  colorClass = 'bg-primary-50 text-primary-600'
}: StatCardProps) => {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }[trend];

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {value}
            {suffix && <span className="text-xl text-gray-600 ml-1">{suffix}</span>}
          </p>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${trendColor}`}>
              {change > 0 ? '+' : ''}{change}% от прошлого периода
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
