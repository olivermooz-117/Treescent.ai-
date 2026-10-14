import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Links', href: '/dashboard/links', icon: LinkIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
];

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserMenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <NavLink to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
              <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M16 2L4 8v16l12 6 12-6V8L16 2zm0 2.5L25.5 9 16 13.5 6.5 9 16 4.5zM6 10.5l9 4.5v9l-9-4.5v-9zm10 0v9l9-4.5v-9l-9 4.5z" />
              </svg>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Treescent</span>
            </NavLink>
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main">
            <ul className="space-y-1" role="list">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive: active }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${active
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                  {user?.display_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.display_name || user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user?.username}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              fullWidth
              className="mt-2 justify-start gap-3"
              onClick={handleLogout}
            >
              <LogoutIcon />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};