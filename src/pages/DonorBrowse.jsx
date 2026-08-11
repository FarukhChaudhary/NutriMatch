import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Users, Heart, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { VILLAGES, DEFICIENCY_RECORDS } from '../data/mockData';
import { SeverityBadge, DeficiencyDot } from '../components/DeficiencyBadge';
import clsx from 'clsx';

const STATES = [...new Set(VILLAGES.map(v => v.state))];

export default function DonorBrowse() {
  const { t, formatNumber } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  const filtered = useMemo(() => {
    return VILLAGES.filter(v => {
      if (search && !v.name.toLowerCase().includes(search.toLowerCase()) &&
          !v.district.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterState && v.state !== filterState) return false;
      if (filterSeverity) {
        const defs = DEFICIENCY_RECORDS.filter(d => d.village_id === v.id);
        if (!defs.some(d => d.severity === filterSeverity)) return false;
      }
      return true;
    });
  }, [search, filterState, filterSeverity]);

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 page-enter">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-700 dark:to-teal-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur rounded-full text-sm font-medium mb-4">
              <Heart size={14} /> Donor Portal
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl mb-3">{t('donor.title')}</h1>
            <p className="text-teal-100 text-base">{t('donor.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              type="text"
              placeholder="Search village or district…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-800 dark:text-warm-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select value={filterState} onChange={e => setFilterState(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-700 dark:text-warm-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option value="">{t('dashboard.filterByState')}</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-700 dark:text-warm-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option value="">All severity</option>
              {['mild', 'moderate', 'severe'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Village list */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-warm-400 dark:text-warm-500">{t('dashboard.noVillagesFound')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(village => {
              const defs = DEFICIENCY_RECORDS.filter(d => d.village_id === village.id);
              const sorted = [...defs].sort((a, b) => ({ severe: 0, moderate: 1, mild: 2 }[a.severity] - { severe: 0, moderate: 1, mild: 2 }[b.severity]));
              const topDef = sorted[0];
              const totalAffected = Math.round(village.child_population * (topDef?.prevalence_pct ?? 50) / 100);

              return (
                <Link key={village.id} to={`/village/${village.id}`}
                  className="group flex items-center gap-4 bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card hover:shadow-card-hover p-5 transition-all hover:-translate-y-0.5">
                  {/* Urgency indicator */}
                  <div className={clsx(
                    'w-1.5 self-stretch rounded-full flex-shrink-0',
                    topDef?.severity === 'severe' ? 'bg-red-400' : topDef?.severity === 'moderate' ? 'bg-orange-400' : 'bg-amber-400'
                  )} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display font-semibold text-warm-900 dark:text-warm-100">{village.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-warm-500 dark:text-warm-400 mt-0.5">
                          <MapPin size={12} />
                          <span>{village.district}, {village.state}</span>
                        </div>
                      </div>
                      {topDef && <SeverityBadge severity={topDef.severity} />}
                    </div>

                    {/* Deficiency dots */}
                    <div className="flex items-center gap-2 mt-3">
                      {sorted.map(d => (
                        <div key={d.id} className="flex items-center gap-1">
                          <DeficiencyDot type={d.deficiency_type} size="sm" />
                          <span className="text-xs text-warm-500 dark:text-warm-400">{d.prevalence_pct}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Children affected */}
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-warm-600 dark:text-warm-400">
                      <Users size={13} />
                      <span>~{formatNumber(totalAffected)} {t('common.children')} {t('village.childrenAffected')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Link
                      to={`/pledge/${village.id}`}
                      onClick={e => e.stopPropagation()}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                      {t('donor.pledge')}
                    </Link>
                    <ChevronRight size={18} className="text-warm-300 dark:text-warm-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
