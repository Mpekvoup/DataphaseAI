import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TrainingProgressProps {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  experimentId?: number;
  taskId?: string;
  startTime?: Date;
  message?: string;
}

const TrainingProgress = ({
  status,
  progress = 0,
  experimentId,
  taskId,
  startTime,
  message
}: TrainingProgressProps) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'blue',
          text: 'В очереди',
          description: 'Ожидание начала обучения...'
        };
      case 'running':
        return {
          icon: Loader2,
          color: 'blue',
          text: 'Обучение',
          description: 'Модель обучается на ваших данных...'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'green',
          text: 'Завершено',
          description: 'Обучение успешно завершено'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'red',
          text: 'Ошибка',
          description: 'Произошла ошибка при обучении'
        };
      default:
        return {
          icon: Clock,
          color: 'gray',
          text: 'Неизвестно',
          description: ''
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  const getElapsedTime = (): string => {
    if (!startTime) return '';

    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now.getTime() - start.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);

    if (diffHr > 0) {
      return `${diffHr}ч ${diffMin % 60}м`;
    } else if (diffMin > 0) {
      return `${diffMin}м ${diffSec % 60}с`;
    } else {
      return `${diffSec}с`;
    }
  };

  return (
    <div className="card">
      <div className="space-y-4">
        {/* Заголовок и статус */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${statusInfo.color}-100`}>
              <Icon
                size={24}
                className={`text-${statusInfo.color}-600 ${
                  status === 'running' ? 'animate-spin' : ''
                }`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {statusInfo.text}
              </h3>
              <p className="text-sm text-gray-600">{statusInfo.description}</p>
            </div>
          </div>
          {startTime && status === 'running' && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Время выполнения</p>
              <p className="text-lg font-semibold text-gray-900">
                {getElapsedTime()}
              </p>
            </div>
          )}
        </div>

        {/* Прогресс бар */}
        {(status === 'running' || status === 'pending') && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Прогресс</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  status === 'running'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : 'bg-blue-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Информация о задаче */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          {experimentId && (
            <div>
              <p className="text-sm text-gray-600 mb-1">ID эксперимента</p>
              <p className="font-mono text-sm font-medium text-gray-900">
                {experimentId}
              </p>
            </div>
          )}
          {taskId && (
            <div>
              <p className="text-sm text-gray-600 mb-1">ID задачи</p>
              <p className="font-mono text-sm font-medium text-gray-900 truncate">
                {taskId}
              </p>
            </div>
          )}
        </div>

        {/* Сообщение об ошибке или дополнительная информация */}
        {message && (
          <div
            className={`p-3 rounded-lg border ${
              status === 'failed'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <p
              className={`text-sm ${
                status === 'failed' ? 'text-red-700' : 'text-blue-700'
              }`}
            >
              {message}
            </p>
          </div>
        )}

        {/* Индикатор активности для статуса running */}
        {status === 'running' && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150" />
            </div>
            <span>Обработка данных...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingProgress;
