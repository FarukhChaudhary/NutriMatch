import { Link } from 'react-router-dom';
import { MapPin, Users, TrendingUp, ArrowRight, AlertTriangle } from 'lucide-react';
import { DeficiencyBadge } from './DeficiencyBadge';
import { useLanguage } from '../context/LanguageContext';
import { DEFICIENCY_RECORDS, NGO_ACTIVITIES } from '../data/mockData';
import clsx from 'clsx';

const STATE_COLORS = {
  'Maharashtra': 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  'Rajasthan':   'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'Uttar Pradesh': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  'Madhya Pradesh': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
};

export default function VillageCard({ village }) {
  const { t, formatNumber } = useLanguage();
  const deficiencies = DEFICIENCY_RECORDS.filter(d => d.village_id === village.id);
  const activities = NGO_ACTIVITIES.filter(a => a.village_id === village.id && a.status === 'active');

  const hasSevere = deficiencies.some(d => d.severity === 'severe');
  const stateColor = STATE_COLORS[village.state] ?? 'bg-warm-100 text-warm-700 dark:bg-warm-700 dark:text-warm-300';

  // Sort deficiencies: severe first
  const sortedDefs = [...deficiencies].sort((a, b) => {
    const order = { severe: 0, moderate: 1, mild: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className={clsx(
      'group bg-white dark:bg-warm-900 rounded-2xl border shadow-card card-hover cursor-pointer overflow-hidden',
      'border-warm-200 dark:border-warm-700',
      hasSevere && 'ring-2 ring-red-200 dark:ring-red-900/50'
    )}>
      {/* Card header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg text-warm-900 dark:text-warm-100 truncate">
              {village.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin size={13} className="text-warm-400 flex-shrink-0" />
              <span className="text-warm-500 dark:text-warm-400 text-sm truncate">
                {village.district}, {village.state}
              </span>
            </div>
          </div>
          <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0', stateColor)}>
            {village.state}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-warm-600 dark:text-warm-400">
            <Users size={14} />
            <span>{formatNumber(village.child_population)} {t('common.children')}</span>
          </div>
          {activities.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400">
              <TrendingUp size={14} />
              <span>{activities.length} NGO active</span>
            </div>
          )}
        </div>

        {/* Deficiency badges — show top 3 */}
        <div className="space-y-2">
          {sortedDefs.slice(0, 3).map(def => (
            <DeficiencyBadge
              key={def.id}
              type={def.deficiency_type}
              severity={def.severity}
              prevalence={def.prevalence_pct}
            />
          ))}
          {deficiencies.length > 3 && (
            <p className="text-xs text-warm-400 dark:text-warm-500 px-1">
              +{deficiencies.length - 3} more deficiencies
            </p>
          )}
        </div>

        {/* Overlap warning */}
        {activities.length > 1 && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">{t('village.overlapWarning')}</p>
          </div>
        )}
      </div>

      {/* Card footer CTA */}
      <div className="px-5 py-3 bg-warm-50 dark:bg-warm-800/50 border-t border-warm-100 dark:border-warm-700">
        <Link
          to={`/village/${village.id}`}
          className="flex items-center justify-between text-sm font-medium text-saffron-600 dark:text-saffron-400 group-hover:text-saffron-700 dark:group-hover:text-saffron-300 transition-colors"
        >
          <span>{t('common.viewDetails')}</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
