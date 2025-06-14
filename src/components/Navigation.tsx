
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp, Briefcase, Bell, Home } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/alerts', icon: Bell, label: 'Alerts' },
  ];

  return (
    <nav className="glass-card p-3 sm:p-4 rounded-lg mb-8">
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 sm:flex-nowrap sm:justify-start sm:space-x-3 md:space-x-4 lg:space-x-6">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 py-2 sm:px-3 md:px-4 rounded-lg transition-colors ${
              location.pathname === path
                ? 'bg-blue-500/20 text-blue-400'
                : 'hover:bg-secondary/30'
            }`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-xs sm:text-sm md:text-base">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
