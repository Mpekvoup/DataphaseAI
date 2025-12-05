import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  Brain,
  Users,
  Bell,
  Save
} from 'lucide-react';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: SettingsIcon },
    { id: 'ai', label: t('settings.ai'), icon: Brain },
    { id: 'departments', label: t('settings.departments'), icon: Users },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('settings.title')}
        </h1>
        <p className="text-gray-600">
          Настройка системы и параметров работы
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Боковое меню */}
        <div className="lg:col-span-1">
          <div className="card p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Контент */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                Общие настройки
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.language')}
                  </label>
                  <select
                    value={i18n.language}
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ru">Русский</option>
                    <option value="kk">Қазақша</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название организации
                  </label>
                  <input
                    type="text"
                    defaultValue="ИИ Help Desk"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email для уведомлений
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@helpdesk.kz"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Часовой пояс
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>UTC+6 (Астана, Алматы)</option>
                    <option>UTC+3 (Москва)</option>
                    <option>UTC+5 (Ташкент)</option>
                  </select>
                </div>

                <button className="btn-primary flex items-center gap-2">
                  <Save size={20} />
                  {t('common.save')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                Настройки ИИ
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Минимальная уверенность для авто-решения (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="85"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>0%</span>
                    <span className="font-medium">85%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Модель классификации
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option>GPT-4 Turbo (Рекомендуется)</option>
                    <option>GPT-4</option>
                    <option>GPT-3.5 Turbo</option>
                    <option>Custom Model</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      Автоматическая маршрутизация в отделы
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      Генерация подсказок для операторов
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      Автоматический перевод между RU/KZ
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Максимальное время ожидания ответа ИИ (сек)
                  </label>
                  <input
                    type="number"
                    defaultValue="10"
                    min="5"
                    max="60"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <button className="btn-primary flex items-center gap-2">
                  <Save size={20} />
                  {t('common.save')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Отделы и маршрутизация
                </h2>
                <button className="btn-primary">
                  Добавить отдел
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'IT Support', email: 'it@company.kz', members: 8 },
                  { name: 'Tech Team', email: 'tech@company.kz', members: 12 },
                  { name: 'Billing', email: 'billing@company.kz', members: 5 },
                  { name: 'Customer Success', email: 'success@company.kz', members: 6 }
                ].map((dept) => (
                  <div key={dept.name} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{dept.name}</h3>
                        <p className="text-sm text-gray-600">{dept.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {dept.members} сотрудников
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary text-sm">
                          {t('common.edit')}
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                Уведомления
              </h2>

              <div className="space-y-6">
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Email уведомления
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Новые заявки
                        </div>
                        <div className="text-xs text-gray-600">
                          Получать уведомления о новых заявках
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Критические заявки
                        </div>
                        <div className="text-xs text-gray-600">
                          Уведомления о срочных заявках
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Еженедельные отчеты
                        </div>
                        <div className="text-xs text-gray-600">
                          Получать сводку за неделю
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pb-6 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4">
                    Push уведомления
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Ошибки ИИ
                        </div>
                        <div className="text-xs text-gray-600">
                          Уведомления об ошибках системы
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <button className="btn-primary flex items-center gap-2">
                  <Save size={20} />
                  {t('common.save')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
