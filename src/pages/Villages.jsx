import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import VillageCard from '../components/VillageCard';
import { useLanguage } from '../context/LanguageContext';
import { VILLAGES } from '../data/mockData';

const STATES = [...new Set(VILLAGES.map(v => v.state))];

export default function Villages() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');

  const filtered = useMemo(() => {
    return VILLAGES.filter(v => {
      if (search && !v.name.toLowerCase().includes(search.toLowerCase()) &&
          !v.district.toLowerCase().includes(search.toLowerCase()) &&
          !v.state.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterState && v.state !== filterState) return false;
      return true;
    });
  }, [search, filterState]);

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-warm-900 dark:text-warm-100 mb-1">{t('nav.villages')}</h1>
          <p className="text-warm-500 dark:text-warm-400 text-sm">{filtered.length} villages tracked</p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              type="text"
              placeholder="Search village, district, or state…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-800 dark:text-warm-200 focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
            className="sm:w-48 px-3 py-2.5 bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-700 dark:text-warm-300 focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
          >
            <option value="">{t('dashboard.filterByState')}</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-warm-400 dark:text-warm-500 mb-2">{t('dashboard.noVillagesFound')}</p>
            <button onClick={() => { setSearch(''); setFilterState(''); }}
              className="text-saffron-600 dark:text-saffron-400 text-sm font-medium hover:underline">
              {t('dashboard.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(v => <VillageCard key={v.id} village={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
