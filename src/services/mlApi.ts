// API сервис для интеграции с FastAPI бэкендом

const API_BASE_URL = 'https://resumptively-uncapsuled-rosemarie.ngrok-free.dev';

// Интерфейсы для типизации
export interface UploadResponse {
  dataset_id: number;
  status: string;
}

export interface TrainRequest {
  dataset_id: number;
  model_type: 'forecast' | 'anomaly';
}

export interface TrainResponse {
  experiment_id: number;
  task_id: string;
  status: string;
}

export interface ExperimentResult {
  status: 'pending' | 'running' | 'completed' | 'failed';
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    [key: string]: any;
  };
  model_type: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

class MLApiService {
  private token: string | null = null;

  constructor() {
    // Восстановление токена из localStorage при инициализации
    this.token = localStorage.getItem('ml_access_token');
  }

  /**
   * Получение токена аутентификации
   */
  async authenticate(email: string, password: string): Promise<void> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data: AuthResponse = await response.json();
      this.token = data.access_token;
      localStorage.setItem('ml_access_token', data.access_token);
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Получение заголовков с токеном
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Загрузка файла CSV/XLSX
   */
  async uploadFile(file: File): Promise<UploadResponse> {
    // Проверка типа файла
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type) &&
        !file.name.endsWith('.csv') &&
        !file.name.endsWith('.xlsx')) {
      throw new Error('Only CSV and XLSX files are allowed');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/data/upload`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
      });

      if (response.status === 401) {
        throw new Error('Unauthorized. Please login first.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Запуск обучения модели
   */
  async trainModel(datasetId: number, modelType: 'forecast' | 'anomaly'): Promise<TrainResponse> {
    const requestBody: TrainRequest = {
      dataset_id: datasetId,
      model_type: modelType,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/ml/train`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 401) {
        throw new Error('Unauthorized. Please login first.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Training start failed');
      }

      const data: TrainResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Training error:', error);
      throw error;
    }
  }

  /**
   * Получение результатов эксперимента
   */
  async getResults(experimentId: number): Promise<ExperimentResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/ml/results/${experimentId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.status === 401) {
        throw new Error('Unauthorized. Please login first.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to get results');
      }

      const data: ExperimentResult = await response.json();
      return data;
    } catch (error) {
      console.error('Get results error:', error);
      throw error;
    }
  }

  /**
   * Скачивание файла (модели, результатов)
   */
  async downloadFile(filename: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${filename}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  /**
   * Вспомогательная функция для скачивания файла в браузере
   */
  downloadBlobAsFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Проверка, аутентифицирован ли пользователь
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Выход из системы
   */
  logout(): void {
    this.token = null;
    localStorage.removeItem('ml_access_token');
  }
}

// Экспортируем единственный экземпляр сервиса
export const mlApi = new MLApiService();
