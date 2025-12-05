import { useTranslation } from 'react-i18next';
import { Bell, User, Globe } from 'lucide-react';

const Header = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ru' ? 'kk' : 'ru';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-64 right-0 z-10 overflow-hidden">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Поиск заявок..."
            className="w-full max-w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={i18n.language === 'ru' ? 'Қазақша' : 'Русский'}
          >
            <Globe size={20} className="text-gray-600" />
            <span className="ml-2 text-sm font-medium text-gray-700">
              {i18n.language.toUpperCase()}
            </span>
          </button>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">Администратор</div>
              <div className="text-gray-500 text-xs">admin@helpdesk.kz</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;