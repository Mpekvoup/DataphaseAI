import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Ticket,
  BarChart3,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { t } = useTranslation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/tickets', icon: Ticket, label: t('nav.tickets') },
    { path: '/analytics', icon: BarChart3, label: t('nav.analytics') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-50">
      <div className="p-[18px] border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">
          {t('app.title')}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {t('app.description')}
        </p>
      </div>

      <nav className="mt-6 px-4">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                index > 0 ? 'mt-3' : ''
              } ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;