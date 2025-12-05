import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import type { MLMetrics } from '../../types';

interface MetricsDisplayProps {
  metrics: MLMetrics;
  modelType: 'forecast' | 'anomaly';
  onDownload?: () => void;
}

const MetricsDisplay = ({ metrics, modelType, onDownload }: MetricsDisplayProps) => {
  // Форматирование метрик для отображения
  const getMetricLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      accuracy: 'Точность',
      precision: 'Precision',
      recall: 'Recall',
      f1_score: 'F1 Score',
      mse: 'MSE',
      mae: 'MAE',
      rmse: 'RMSE'
    };
    return labels[key] || key;
  };

  const getMetricDescription = (key: string): string => {
    const descriptions: { [key: string]: string } = {
      accuracy: 'Доля правильных предсказаний',
      precision: 'Точность положительных предсказаний',
      recall: 'Полнота обнаружения положительных случаев',
      f1_score: 'Гармоническое среднее Precision и Recall',
      mse: 'Средняя квадратичная ошибка',
      mae: 'Средняя абсолютная ошибка',
      rmse: 'Корень из средней квадратичной ошибки'
    };
    return descriptions[key] || '';
  };

  // Преобразование метрик в массив для графика
  const chartData = Object.entries(metrics)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => ({
      name: getMetricLabel(key),
      value: value || 0,
      key
    }));

  // Определение цвета для каждой метрики
  const getBarColor = (value: number, key: string): string => {
    // Для ошибок (MSE, MAE, RMSE) - чем меньше, тем лучше
    if (['mse', 'mae', 'rmse'].includes(key)) {
      if (value < 0.1) return '#10b981'; // green
      if (value < 0.3) return '#f59e0b'; // amber
      return '#ef4444'; // red
    }

    // Для остальных метрик - чем больше, тем лучше
    if (value >= 0.9) return '#10b981'; // green
    if (value >= 0.7) return '#3b82f6'; // blue
    if (value >= 0.5) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  // Форматирование значения метрики
  const formatValue = (value: number, key: string): string => {
    if (['mse', 'mae', 'rmse'].includes(key)) {
      return value.toFixed(4);
    }
    return (value * 100).toFixed(2) + '%';
  };

  // Получение главной метрики
  const getPrimaryMetric = (): { key: string; value: number } | null => {
    if (modelType === 'forecast') {
      if (metrics.rmse !== undefined) return { key: 'rmse', value: metrics.rmse };
      if (metrics.mae !== undefined) return { key: 'mae', value: metrics.mae };
    } else {
      if (metrics.f1_score !== undefined) return { key: 'f1_score', value: metrics.f1_score };
      if (metrics.accuracy !== undefined) return { key: 'accuracy', value: metrics.accuracy };
    }
    return null;
  };

  const primaryMetric = getPrimaryMetric();

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Метрики модели</h3>
          <p className="text-sm text-gray-600">
            Результаты обучения модели {modelType === 'forecast' ? 'прогнозирования' : 'обнаружения аномалий'}
          </p>
        </div>
        {onDownload && (
          <button onClick={onDownload} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Скачать модель
          </button>
        )}
      </div>

      {/* Главная метрика */}
      {primaryMetric && (
        <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">Основная метрика</p>
              <p className="text-3xl font-bold mb-1">
                {formatValue(primaryMetric.value, primaryMetric.key)}
              </p>
              <p className="text-primary-100 text-sm">{getMetricLabel(primaryMetric.key)}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Таблица метрик */}
      <div className="card">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Все метрики</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(metrics).map(([key, value]) => {
            if (value === undefined) return null;

            return (
              <div
                key={key}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {getMetricLabel(key)}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatValue(value, key)}
                  </span>
                </div>
                {getMetricDescription(key) && (
                  <p className="text-xs text-gray-500">{getMetricDescription(key)}</p>
                )}
                {/* Индикатор качества */}
                {!['mse', 'mae', 'rmse'].includes(key) && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${value * 100}%`,
                        backgroundColor: getBarColor(value, key)
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* График метрик */}
      {chartData.length > 0 && (
        <div className="card">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Визуализация метрик</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  formatValue(value, props.payload.key),
                  name
                ]}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value, entry.key)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Интерпретация результатов */}
      <div className="card bg-blue-50 border border-blue-200">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">
          Интерпретация результатов
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          {modelType === 'forecast' ? (
            <>
              <p>
                <strong>RMSE (Root Mean Squared Error):</strong> Чем ниже значение, тем точнее модель.
                Значение показывает среднее отклонение предсказаний от реальных значений.
              </p>
              <p>
                <strong>MAE (Mean Absolute Error):</strong> Средняя абсолютная ошибка предсказаний.
                Более устойчива к выбросам, чем RMSE.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Accuracy:</strong> Общая точность модели. Значение выше 80% считается хорошим результатом.
              </p>
              <p>
                <strong>F1 Score:</strong> Баланс между Precision и Recall.
                Оптимальное значение близко к 1.0 (или 100%).
              </p>
              <p>
                <strong>Precision:</strong> Доля правильных положительных предсказаний среди всех положительных.
              </p>
              <p>
                <strong>Recall:</strong> Доля обнаруженных положительных случаев из всех реальных положительных.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsDisplay;
