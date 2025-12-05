import { useState, useEffect } from 'react';
import { Brain, Upload, Settings, BarChart3, ArrowRight } from 'lucide-react';
import FileUploader from '../../components/ml/FileUploader';
import ModelConfiguration from '../../components/ml/ModelConfiguration';
import TrainingProgress from '../../components/ml/TrainingProgress';
import MetricsDisplay from '../../components/ml/MetricsDisplay';
import { mlApi } from '../../services/mlApi';
import type { MLMetrics } from '../../types';

type Step = 'upload' | 'configure' | 'training' | 'results';

const MLTraining = () => {
  // Состояния
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [datasetId, setDatasetId] = useState<number | null>(null);
  const [modelType, setModelType] = useState<'forecast' | 'anomaly'>('forecast');
  const [experimentId, setExperimentId] = useState<number | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  // Статусы и прогресс
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string>('');

  const [trainingStatus, setTrainingStatus] = useState<'pending' | 'running' | 'completed' | 'failed'>('pending');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStartTime, setTrainingStartTime] = useState<Date | null>(null);
  const [trainingMessage, setTrainingMessage] = useState<string>('');

  const [metrics, setMetrics] = useState<MLMetrics | null>(null);

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const initAuth = async () => {
      if (!mlApi.isAuthenticated()) {
        try {
          // Автоматическая аутентификация с учетными данными из localStorage
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.email) {
            await mlApi.authenticate(user.email, 'default_password');
          }
        } catch (error) {
          console.error('Auto-authentication failed:', error);
        }
      }
    };
    initAuth();
  }, []);

  // Опрос результатов обучения
  useEffect(() => {
    if (experimentId && trainingStatus === 'running') {
      const interval = setInterval(async () => {
        try {
          const results = await mlApi.getResults(experimentId);

          if (results.status === 'completed') {
            setTrainingStatus('completed');
            setTrainingProgress(100);
            setMetrics(results.metrics || null);
            setCurrentStep('results');
            clearInterval(interval);
          } else if (results.status === 'failed') {
            setTrainingStatus('failed');
            setTrainingMessage('Обучение завершилось с ошибкой');
            clearInterval(interval);
          } else if (results.status === 'running') {
            // Симулируем прогресс
            setTrainingProgress(prev => Math.min(prev + 5, 95));
          }
        } catch (error) {
          console.error('Error polling results:', error);
        }
      }, 3000); // Проверка каждые 3 секунды

      return () => clearInterval(interval);
    }
  }, [experimentId, trainingStatus]);

  // Обработка выбора файла
  const handleFileSelect = async (file: File) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadError('');

    try {
      // Симуляция прогресса загрузки
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await mlApi.uploadFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      setDatasetId(response.dataset_id);

      // Переход на следующий шаг через 1 секунду
      setTimeout(() => {
        setCurrentStep('configure');
      }, 1000);
    } catch (error) {
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Ошибка загрузки файла');
      setUploadProgress(0);
    }
  };

  // Запуск обучения
  const handleStartTraining = async () => {
    if (!datasetId) {
      alert('Пожалуйста, сначала загрузите файл');
      return;
    }

    setCurrentStep('training');
    setTrainingStatus('pending');
    setTrainingProgress(0);
    setTrainingStartTime(new Date());

    try {
      const response = await mlApi.trainModel(datasetId, modelType);
      setExperimentId(response.experiment_id);
      setTaskId(response.task_id);
      setTrainingStatus('running');
      setTrainingProgress(10);
      setTrainingMessage('Модель начала обучение на ваших данных');
    } catch (error) {
      setTrainingStatus('failed');
      setTrainingMessage(error instanceof Error ? error.message : 'Ошибка запуска обучения');
    }
  };

  // Скачивание модели
  const handleDownloadModel = async () => {
    try {
      // Предполагаем, что имя файла модели - model_<experimentId>.pkl
      const filename = `model_${experimentId}.pkl`;
      const blob = await mlApi.downloadFile(filename);
      mlApi.downloadBlobAsFile(blob, filename);
    } catch (error) {
      alert('Ошибка скачивания модели: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  // Сброс и начало заново
  const handleReset = () => {
    setCurrentStep('upload');
    setDatasetId(null);
    setExperimentId(null);
    setTaskId(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadError('');
    setTrainingStatus('pending');
    setTrainingProgress(0);
    setTrainingStartTime(null);
    setTrainingMessage('');
    setMetrics(null);
  };

  // Шаги процесса
  const steps = [
    { key: 'upload', label: 'Загрузка данных', icon: Upload },
    { key: 'configure', label: 'Настройка модели', icon: Settings },
    { key: 'training', label: 'Обучение', icon: Brain },
    { key: 'results', label: 'Результаты', icon: BarChart3 }
  ];

  const getStepStatus = (stepKey: string): 'completed' | 'current' | 'upcoming' => {
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    const currentIndex = steps.findIndex(s => s.key === currentStep);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Обучение AI Модели
        </h1>
        <p className="text-gray-600">
          Загрузите данные, настройте параметры модели и запустите обучение
        </p>
      </div>

      {/* Индикатор прогресса */}
      <div className="card">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const status = getStepStatus(step.key);

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : status === 'current'
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      status === 'current' ? 'text-primary-600' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight
                    size={20}
                    className={`mx-4 ${
                      getStepStatus(steps[index + 1].key) === 'completed'
                        ? 'text-green-500'
                        : 'text-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Контент в зависимости от шага */}
      <div className="space-y-6">
        {currentStep === 'upload' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Шаг 1: Загрузка данных
            </h2>
            <FileUploader
              onFileSelect={handleFileSelect}
              isUploading={uploadStatus === 'uploading'}
              uploadProgress={uploadProgress}
              uploadStatus={uploadStatus}
              errorMessage={uploadError}
            />
          </div>
        )}

        {currentStep === 'configure' && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Шаг 2: Настройка модели
            </h2>
            <ModelConfiguration
              modelType={modelType}
              onModelTypeChange={setModelType}
            />
            <div className="mt-6 flex gap-3">
              <button onClick={() => setCurrentStep('upload')} className="btn-secondary">
                Назад
              </button>
              <button onClick={handleStartTraining} className="btn-primary">
                Начать обучение
              </button>
            </div>
          </div>
        )}

        {currentStep === 'training' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Шаг 3: Обучение модели
            </h2>
            <TrainingProgress
              status={trainingStatus}
              progress={trainingProgress}
              experimentId={experimentId || undefined}
              taskId={taskId || undefined}
              startTime={trainingStartTime || undefined}
              message={trainingMessage}
            />
          </div>
        )}

        {currentStep === 'results' && metrics && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Шаг 4: Результаты обучения
            </h2>
            <MetricsDisplay
              metrics={metrics}
              modelType={modelType}
              onDownload={handleDownloadModel}
            />
            <div className="mt-6 flex gap-3">
              <button onClick={handleReset} className="btn-secondary">
                Обучить новую модель
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MLTraining;
