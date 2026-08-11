import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Heart, Mail, Lock, User, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'donor', organization: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate network

    if (mode === 'login') {
      const result = login(form.email, form.password);
      if (result.success) {
        setSuccess(t('auth.loginSuccess'));
        setTimeout(() => navigate('/'), 800);
      } else {
        setError(t('auth.loginError'));
      }
    } else {
      const result = register(form.name, form.email, form.role, form.organization);
      if (result.success) {
        setSuccess(t('auth.registerSuccess'));
        setTimeout(() => navigate('/'), 800);
      }
    }
    setLoading(false);
  };

  const DEMO_ACCOUNTS = [
    { email: 'akanksha@ngo.org', role: 'NGO', color: 'text-teal-600 dark:text-teal-400' },
    { email: 'rahul@email.com', role: 'Donor', color: 'text-saffron-600 dark:text-saffron-400' },
    { email: 'priya@govt.in', role: 'Manager', color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 flex items-center justify-center px-4 page-enter">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-saffron-500 flex items-center justify-center shadow-lg mx-auto mb-4">
            <Heart size={26} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-warm-900 dark:text-warm-100">NutriMatch</h1>
          <p className="text-warm-500 dark:text-warm-400 text-sm mt-1">Child Nutrition Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-8">
          {/* Tab toggle */}
          <div className="flex bg-warm-100 dark:bg-warm-800 rounded-xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                className={clsx(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                  mode === m ? 'bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-100 shadow-sm' : 'text-warm-500 dark:text-warm-400'
                )}
              >
                {m === 'login' ? t('auth.login') : t('auth.register')}
              </button>
            ))}
          </div>

          {/* Success / Error */}
          {success && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl text-sm text-teal-700 dark:text-teal-300">
              <CheckCircle size={15} /> {success}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('auth.name')}</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
                  <input
                    type="text" required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  type="password" required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('auth.role')}</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                  >
                    <option value="donor">{t('auth.roleDonor')}</option>
                    <option value="ngo">{t('auth.roleNgo')}</option>
                    <option value="program_manager">{t('auth.roleManager')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('auth.organization')}</label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
                    <input
                      type="text"
                      value={form.organization}
                      onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                      className="w-full pl-9 pr-3 py-2.5 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                      placeholder="Your organisation name"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 disabled:bg-saffron-300 text-white rounded-xl font-semibold text-sm transition-all shadow-sm mt-2"
            >
              {loading ? t('common.loading') : mode === 'login' ? t('auth.login') : t('auth.register')}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 p-5">
          <p className="text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase tracking-wider mb-3">Demo Accounts (any password)</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(({ email, role, color }) => (
              <button
                key={email}
                onClick={() => setForm(f => ({ ...f, email }))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors text-left"
              >
                <span className="text-sm text-warm-700 dark:text-warm-300 font-mono">{email}</span>
                <span className={clsx('text-xs font-medium', color)}>{role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
