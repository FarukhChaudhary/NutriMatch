import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Globe, Menu, X, Heart, LayoutDashboard, Map, Users, LogOut, LogIn } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const links = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/villages', label: t('nav.villages'), icon: Map },
    { to: '/donate', label: t('nav.donate'), icon: Heart },
    ...(user?.role === 'ngo' || user?.role === 'program_manager'
      ? [{ to: '/ngo', label: t('nav.ngo'), icon: Users }]
      : []),
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-warm-900/90 backdrop-blur-md border-b border-warm-200 dark:border-warm-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-saffron-500 flex items-center justify-center shadow-sm group-hover:bg-saffron-600 transition-colors">
              <span className="text-white font-display font-bold text-sm">NM</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-warm-900 dark:text-warm-100 text-lg">NutriMatch</span>
              <p className="text-warm-500 dark:text-warm-400 text-xs -mt-0.5">Child Nutrition Platform</p>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive(to)
                    ? 'bg-saffron-50 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400'
                    : 'text-warm-600 hover:text-warm-900 hover:bg-warm-100 dark:text-warm-400 dark:hover:text-warm-100 dark:hover:bg-warm-800'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(p => !p)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
                aria-label="Switch language"
              >
                <Globe size={16} />
                <span className="hidden sm:block font-medium">{LANGUAGES.find(l => l.code === lang)?.label}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-warm-800 rounded-xl shadow-card-hover border border-warm-200 dark:border-warm-700 overflow-hidden z-50 animate-fade-in">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={clsx(
                        'w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors',
                        lang === l.code
                          ? 'bg-saffron-50 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400 font-semibold'
                          : 'text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700'
                      )}
                    >
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-warm-100 dark:bg-warm-800 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-saffron-400 flex items-center justify-center text-white text-xs font-bold">
                    {user.name[0]}
                  </div>
                  <span className="text-xs font-medium text-warm-700 dark:text-warm-300">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 rounded-lg text-warm-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label={t('nav.logout')}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <LogIn size={15} />
                <span className="hidden sm:block">{t('nav.login')}</span>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-warm-600 dark:text-warm-400 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors"
              onClick={() => setMobileOpen(p => !p)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-warm-100 dark:border-warm-700 animate-slide-up">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1',
                  isActive(to)
                    ? 'bg-saffron-50 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400'
                    : 'text-warm-700 dark:text-warm-300'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
