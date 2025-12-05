import { Brain, TrendingUp } from 'lucide-react';

interface ModelConfigurationProps {
  modelType: 'forecast' | 'anomaly';
  onModelTypeChange: (type: 'forecast' | 'anomaly') => void;
  disabled?: boolean;
}

const ModelConfiguration = ({
  modelType,
  onModelTypeChange,
  disabled = false
}: ModelConfigurationProps) => {
  const models = [
    {
      type: 'forecast' as const,
      title: 'Прогнозирование',
      description: 'Предсказание будущих значений на основе временных рядов',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      type: 'anomaly' as const,
      title: 'Обнаружение аномалий',
      description: 'Выявление необычных паттернов и отклонений в данных',
      icon: Brain,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Тип модели
        </h3>
        <p className="text-sm text-gray-600">
          Выберите тип задачи машинного обучения для ваших данных
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => {
          const Icon = model.icon;
          const isSelected = modelType === model.type;

          return (
            <button
              key={model.type}
              onClick={() => onModelTypeChange(model.type)}
              disabled={disabled}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? `border-${model.color}-500 bg-${model.color}-50`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    isSelected
                      ? `bg-${model.color}-100`
                      : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    size={24}
                    className={
                      isSelected
                        ? `text-${model.color}-600`
                        : 'text-gray-600'
                    }
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {model.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {model.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Дополнительная информация о выбранной модели */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-medium text-blue-900 mb-1">
              Информация
            </h5>
            <p className="text-sm text-blue-800">
              {modelType === 'forecast'
                ? 'Модель прогнозирования будет обучена предсказывать будущие значения на основе исторических данных. Убедитесь, что ваш датасет содержит временные метки.'
                : 'Модель обнаружения аномалий будет обучена выявлять необычные паттерны в данных. Она подходит для задач контроля качества и обнаружения мошенничества.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelConfiguration;
