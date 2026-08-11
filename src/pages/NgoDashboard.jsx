import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { VILLAGES, DEFICIENCY_RECORDS, getTopRecommendations, NGO_ACTIVITIES } from '../data/mockData';
import { AlertTriangle, Plus, CheckCircle, X, Activity, Users, Clock } from 'lucide-react';
import { DeficiencyBadge } from '../components/DeficiencyBadge';
import AidGapMatrix from '../components/AidGapMatrix';
import clsx from 'clsx';

const DEFICIENCY_TYPES = ['iron', 'vitamin_a', 'zinc', 'iodine', 'folate'];

export default function NgoDashboard() {
  const { t, formatDate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activities, setActivities] = useState(
    NGO_ACTIVITIES.map(a => ({ ...a }))
  );
  const [showForm, setShowForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [form, setForm] = useState({
    village_id: '',
    item_distributed: '',
    deficiency_addressed: 'iron',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const myActivities = activities.filter(a =>
    user ? a.ngo_id === user.id : true
  );
  const activeCount = myActivities.filter(a => a.status === 'active').length;
  const completedCount = myActivities.filter(a => a.status === 'completed').length;

  // Overlap detection: find all active activities, group by village+deficiency
  const allActiveActivities = activities.filter(a => a.status === 'active');
  const overlapMap = {};
  allActiveActivities.forEach(a => {
    const key = `${a.village_id}-${a.deficiency_addressed}`;
    if (!overlapMap[key]) overlapMap[key] = [];
    overlapMap[key].push(a);
  });
  const overlaps = Object.values(overlapMap).filter(group => group.length > 1);

  const handleLogActivity = (e) => {
    e.preventDefault();
    const newActivity = {
      id: `a_${Date.now()}`,
      ngo_id: user?.id ?? 'ngo1',
      ...form,
      status: 'active',
      end_date: null,
    };
    setActivities(prev => [newActivity, ...prev]);
    setForm({ village_id: '', item_distributed: '', deficiency_addressed: 'iron', start_date: new Date().toISOString().split('T')[0], notes: '' });
    setShowForm(false);
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const markComplete = (id) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, status: 'completed', end_date: new Date().toISOString().split('T')[0] } : a));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-warm-950 flex items-center justify-center page-enter">
        <div className="text-center max-w-sm px-4">
          <div className="w-14 h-14 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mx-auto mb-4">
            <Users size={26} className="text-warm-400" />
          </div>
          <h2 className="font-display font-semibold text-warm-800 dark:text-warm-200 text-xl mb-2">NGO Portal</h2>
          <p className="text-warm-500 dark:text-warm-400 text-sm mb-5">Please log in with an NGO or Program Manager account to access this portal.</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-xl text-sm font-semibold transition-colors">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 page-enter">
      {/* Header */}
      <div className="bg-white dark:bg-warm-900 border-b border-warm-200 dark:border-warm-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-warm-900 dark:text-warm-100">{t('ngo.dashboard')}</h1>
              <p className="text-warm-500 dark:text-warm-400 text-sm mt-1">{t('ngo.subtitle')}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-saffron-400 flex items-center justify-center text-white text-xs font-bold">{user.name[0]}</div>
                <span className="text-sm text-warm-700 dark:text-warm-300">{user.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400">{user.role}</span>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex-shrink-0"
            >
              <Plus size={16} /> {t('ngo.logActivity')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success toast */}
        {formSuccess && (
          <div className="mb-5 flex items-center gap-2 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl text-sm text-teal-700 dark:text-teal-300 animate-slide-up">
            <CheckCircle size={16} /> {t('ngo.activityLogged')}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5 text-center">
            <p className="text-3xl font-display font-bold text-saffron-600 dark:text-saffron-400">{activeCount}</p>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">{t('ngo.activeVillages')}</p>
          </div>
          <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5 text-center">
            <p className="text-3xl font-display font-bold text-teal-600 dark:text-teal-400">{completedCount}</p>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">{t('ngo.completedInterventions')}</p>
          </div>
          <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5 text-center">
            <p className="text-3xl font-display font-bold text-amber-500">{overlaps.length}</p>
            <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">{t('ngo.overlapAlerts')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overlap alerts */}
          <div className="lg:col-span-1">
            <h2 className="font-display font-semibold text-warm-900 dark:text-warm-100 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              {t('ngo.overlapAlerts')}
            </h2>
            {overlaps.length === 0 ? (
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-5">
                <CheckCircle size={18} className="text-teal-500 mb-2" />
                <p className="text-sm text-teal-700 dark:text-teal-300">{t('ngo.noAlerts')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {overlaps.map((group, i) => {
                  const village = VILLAGES.find(v => v.id === group[0].village_id);
                  return (
                    <div key={i} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                      <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">{t('ngo.overlapDetected')}</p>
                      <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
                        <strong>{village?.name}</strong> — {group[0].deficiency_addressed}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">{group.length} organisations active</p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">{t('ngo.overlapMessage')}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity log */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-semibold text-warm-900 dark:text-warm-100 mb-4">{t('ngo.activeVillages')}</h2>
            <div className="space-y-3">
              {myActivities.map(a => {
                const village = VILLAGES.find(v => v.id === a.village_id);
                const defs = DEFICIENCY_RECORDS.filter(d => d.village_id === a.village_id);
                const recDef = defs.find(d => d.deficiency_type === a.deficiency_addressed);
                return (
                  <div key={a.id} className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link to={`/village/${a.village_id}`} className="font-display font-semibold text-warm-900 dark:text-warm-100 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors">
                            {village?.name ?? a.village_id}
                          </Link>
                          <span className={clsx(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            a.status === 'active' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400' : 'bg-warm-100 text-warm-600 dark:bg-warm-700 dark:text-warm-400'
                          )}>
                            {t(`common.${a.status}`)}
                          </span>
                        </div>
                        <p className="text-sm text-warm-700 dark:text-warm-300">{a.item_distributed}</p>
                        {a.notes && <p className="text-xs text-warm-400 dark:text-warm-500 mt-1 italic">{a.notes}</p>}
                        <div className="flex items-center gap-2 mt-2 text-xs text-warm-400">
                          <Clock size={12} />
                          <span>{formatDate(a.start_date)} — {a.end_date ? formatDate(a.end_date) : 'Ongoing'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {recDef && <DeficiencyBadge type={recDef.deficiency_type} severity={recDef.severity} />}
                        {a.status === 'active' && (
                          <button
                            onClick={() => markComplete(a.id)}
                            className="text-xs text-warm-500 hover:text-teal-600 dark:text-warm-400 dark:hover:text-teal-400 flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle size={13} /> {t('ngo.markComplete')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Log Activity Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card-hover w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg text-warm-900 dark:text-warm-100">{t('ngo.logActivity')}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-warm-100 dark:hover:bg-warm-800 transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleLogActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('ngo.village')}</label>
                <select required value={form.village_id} onChange={e => setForm(f => ({ ...f, village_id: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent">
                  <option value="">Select village…</option>
                  {VILLAGES.map(v => <option key={v.id} value={v.id}>{v.name}, {v.district}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('ngo.itemDistributed')}</label>
                <input required type="text" value={form.item_distributed} onChange={e => setForm(f => ({ ...f, item_distributed: e.target.value }))}
                  placeholder="e.g. Fortified Rice (50kg bags)"
                  className="w-full px-3 py-2.5 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('ngo.deficiencyAddressed')}</label>
                <select value={form.deficiency_addressed} onChange={e => setForm(f => ({ ...f, deficiency_addressed: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent">
                  {DEFICIENCY_TYPES.map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('ngo.startDate')}</label>
                <input type="date" required value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('ngo.notes')}</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Optional notes…"
                  className="w-full px-3 py-2.5 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-warm-200 dark:border-warm-700 rounded-xl text-sm font-medium text-warm-600 dark:text-warm-400 hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors">
                  {t('common.cancel')}
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
                  {t('common.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
