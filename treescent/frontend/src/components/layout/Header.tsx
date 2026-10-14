import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../theme/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
  isMenuOpen: boolean;
}

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const Header = ({ onMenuClick, isMenuOpen }: HeaderProps) => {
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const pageTitle = location.pathname.split('/').filter(Boolean).at(-1) ?? 'dashboard';

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <button
            className="mobile-menu-button lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onMenuClick}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <MenuIcon />
          </button>
          <span className="header-page-title">{pageTitle === 'dashboard' ? 'Dashboard' : pageTitle[0].toUpperCase() + pageTitle.slice(1)}</span>
        </div>

        <div className="header-actions">
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
            <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
            <span className="theme-toggle-label">{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <div className="header-user">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                {user?.display_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.display_name || user?.username}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};