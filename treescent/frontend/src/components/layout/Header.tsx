import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui';

interface HeaderProps {
  onMenuClick: () => void;
}

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onMenuClick}
            aria-label="Open menu"
            aria-expanded="false"
          >
            <MenuIcon />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
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