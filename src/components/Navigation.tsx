
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
    <nav className="glass-card p-4 rounded-lg mb-8">
      <div className="flex space-x-6">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === path
                ? 'bg-blue-500/20 text-blue-400'
                : 'hover:bg-secondary/30'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
