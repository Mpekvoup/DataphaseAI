import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock, Globe } from 'lucide-react';

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Имитация проверки учетных данных
    setTimeout(() => {
      if (email && password) {
        // Сохраняем данные сессии
        localStorage.setItem('user', JSON.stringify({
          email,
          name: email.split('@')[0],
          id: Math.random().toString(36).substr(2, 9)
        }));
        navigate('/');
      } else {
        setError(t('login.error.required') || 'Заполните все поля');
      }
      setLoading(false);
    }, 500);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ru' ? 'kk' : 'ru';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Globe size={18} />
          <span className="text-sm font-medium">{i18n.language.toUpperCase()}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <LogIn className="text-primary-600" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('app.title')}
            </h1>
            <p className="text-gray-600">
              {t('app.description')}
            </p>
          </div>

          {/* Форма */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@helpdesk.kz"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? t('common.loading') : t('login.submit')}
            </button>
          </form>

          {/* Демо учетные данные */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center mb-3">
              {t('login.demo')}
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@helpdesk.kz');
                  setPassword('password');
                }}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-1"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('user@example.com');
                  setPassword('password');
                }}
                className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium py-1"
              >
                User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
