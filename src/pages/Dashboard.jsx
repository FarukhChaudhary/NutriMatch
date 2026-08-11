import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Map, List, SlidersHorizontal, X, Activity, Users, Heart, TrendingUp } from 'lucide-react';
import VillageCard from '../components/VillageCard';
import MapView from '../components/MapView';
import { useLanguage } from '../context/LanguageContext';
import { VILLAGES, DEFICIENCY_RECORDS, NGO_ACTIVITIES, DONOR_PLEDGES } from '../data/mockData';
import clsx from 'clsx';

const DEFICIENCY_COLORS = {
  iron: '#e57373', vitamin_a: '#ffb74d', zinc: '#81c784', iodine: '#64b5f6', folate: '#ba68c8'
};

const STATES = [...new Set(VILLAGES.map(v => v.state))];
const SEVERITIES = ['mild', 'moderate', 'severe'];

// Stat card
function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5 flex items-center gap-4">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-warm-900 dark:text-warm-100">{value}</p>
        <p className="text-sm text-warm-500 dark:text-warm-400">{label}</p>
      </div>
    </div>
  );
}

// Custom tooltip for chart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-warm-800 shadow-card-hover border border-warm-200 dark:border-warm-700 rounded-xl px-4 py-3 text-sm">
      <p className="font-semibold text-warm-800 dark:text-warm-200 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-warm-600 dark:text-warm-400 capitalize">{p.dataKey.replace('_', ' ')}: </span>
          <span className="font-medium text-warm-800 dark:text-warm-200">{p.value}%</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { t, formatNumber } = useLanguage();
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [filterState, setFilterState] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [loading] = useState(false);

  // Aggregate stats
  const totalChildren = VILLAGES.reduce((s, v) => s + v.child_population, 0);
  const activeNGOs = [...new Set(NGO_ACTIVITIES.filter(a => a.status === 'active').map(a => a.ngo_id))].length;
  const pledgesThisMonth = DONOR_PLEDGES.filter(p => p.date >= '2024-03-01').length;

  // Filter villages
  const filteredVillages = useMemo(() => {
    return VILLAGES.filter(v => {
      if (filterState && v.state !== filterState) return false;
      if (filterSeverity) {
        const defs = DEFICIENCY_RECORDS.filter(d => d.village_id === v.id);
        if (!defs.some(d => d.severity === filterSeverity)) return false;
      }
      return true;
    });
  }, [filterState, filterSeverity]);

  // Heatmap chart data — avg prevalence per deficiency per state
  const chartData = useMemo(() => {
    return VILLAGES.map(v => {
      const defs = DEFICIENCY_RECORDS.filter(d => d.village_id === v.id);
      const row = { name: v.name };
      ['iron', 'vitamin_a', 'zinc', 'iodine', 'folate'].forEach(type => {
        const d = defs.find(d => d.deficiency_type === type);
        row[type] = d ? d.prevalence_pct : 0;
      });
      return row;
    });
  }, []);

  const clearFilters = () => { setFilterState(''); setFilterSeverity(''); };
  const hasFilters = filterState || filterSeverity;

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 page-enter">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-saffron-500 to-saffron-600 dark:from-saffron-700 dark:to-saffron-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-2xl">
            <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2">{t('dashboard.title')}</h1>
            <p className="text-saffron-100 text-base">{t('dashboard.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Activity}    value={VILLAGES.length}        label={t('dashboard.villagesTracked')}  color="bg-saffron-400" />
          <StatCard icon={Users}       value={formatNumber(totalChildren)} label={t('dashboard.childrenReached')} color="bg-teal-500" />
          <StatCard icon={TrendingUp}  value={activeNGOs}             label={t('dashboard.activeNGOs')}       color="bg-purple-500" />
          <StatCard icon={Heart}       value={pledgesThisMonth}       label={t('dashboard.pledgesThisMonth')} color="bg-blue-500" />
        </div>

        {/* Deficiency Heatmap Chart */}
        <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5 mb-8">
          <h2 className="font-display font-semibold text-warm-900 dark:text-warm-100 text-lg mb-4 flex items-center gap-2">
            <Activity size={18} className="text-saffron-500" />
            {t('dashboard.deficiencyHeatmap')}
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 16, left: -20, bottom: 40 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#8c8c78' }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#8c8c78' }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                {Object.entries(DEFICIENCY_COLORS).map(([key, color]) => (
                  <Bar key={key} dataKey={key} stackId="a" fill={color} radius={key === 'folate' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {Object.entries(DEFICIENCY_COLORS).map(([key, color]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-warm-600 dark:text-warm-400">
                <span className="w-3 h-3 rounded-full" style={{ background: color }} />
                {key.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>

        {/* Filters + view toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <SlidersHorizontal size={16} className="text-warm-400" />
            <select
              value={filterState}
              onChange={e => setFilterState(e.target.value)}
              className="flex-1 sm:flex-none sm:w-48 text-sm bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700 rounded-xl px-3 py-2 text-warm-700 dark:text-warm-300 focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
            >
              <option value="">{t('dashboard.filterByState')}</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
              className="flex-1 sm:flex-none sm:w-48 text-sm bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700 rounded-xl px-3 py-2 text-warm-700 dark:text-warm-300 focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
            >
              <option value="">{t('dashboard.filterBySeverity')}</option>
              {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-warm-500 hover:text-red-500 transition-colors px-2 py-2">
                <X size={14} /> {t('dashboard.clearFilters')}
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-warm-100 dark:bg-warm-800 rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all', viewMode === 'list' ? 'bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-100 shadow-sm' : 'text-warm-500 dark:text-warm-400')}
            >
              <List size={15} /> {t('dashboard.listView')}
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all', viewMode === 'map' ? 'bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-100 shadow-sm' : 'text-warm-500 dark:text-warm-400')}
            >
              <Map size={15} /> {t('dashboard.mapView')}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton h-72 rounded-2xl" />
            ))}
          </div>
        ) : viewMode === 'map' ? (
          <div className="h-[520px] bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card overflow-hidden">
            <MapView filterState={filterState} />
          </div>
        ) : filteredVillages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-warm-100 dark:bg-warm-800 flex items-center justify-center mb-4">
              <Activity size={28} className="text-warm-300 dark:text-warm-600" />
            </div>
            <h3 className="font-display font-semibold text-warm-700 dark:text-warm-300 mb-2">{t('dashboard.noVillagesFound')}</h3>
            <button onClick={clearFilters} className="text-saffron-600 dark:text-saffron-400 text-sm font-medium hover:underline">
              {t('dashboard.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredVillages.map(v => <VillageCard key={v.id} village={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
