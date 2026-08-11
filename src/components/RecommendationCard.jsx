import { Award, ExternalLink, BookOpen, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const RANK_COLORS = [
  'bg-yellow-400 text-yellow-900',
  'bg-slate-300 text-slate-800',
  'bg-amber-600 text-amber-100',
];

const DEFICIENCY_LABELS = {
  iron: 'Iron', vitamin_a: 'Vitamin A', zinc: 'Zinc', iodine: 'Iodine', folate: 'Folate'
};

function ScoreBar({ label, value, max = 10, color }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-warm-500 dark:text-warm-400 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-warm-100 dark:bg-warm-700 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      <span className="text-xs font-mono text-warm-600 dark:text-warm-300 w-6 text-right">{value}</span>
    </div>
  );
}

export default function RecommendationCard({ rec, rank, villageId }) {
  const { t } = useLanguage();

  const rankLabel = rank <= 3 ? rank : rank;
  const computedPct = Math.round(rec.computedScore * 10);

  return (
    <div className={clsx(
      'bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card overflow-hidden',
      'hover:shadow-card-hover transition-shadow animate-slide-up'
    )}>
      {/* Header */}
      <div className="flex items-start gap-4 p-5 pb-4">
        {/* Rank badge */}
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0',
          RANK_COLORS[(rank - 1) % 3] ?? 'bg-warm-200 text-warm-700'
        )}>
          #{rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-warm-900 dark:text-warm-100 text-base leading-tight">
              {t(`foods.${rec.id}.name`) !== `foods.${rec.id}.name` ? t(`foods.${rec.id}.name`) : rec.food_name}
            </h3>
            <span className="shrink-0 flex items-center gap-1 text-sm font-bold text-saffron-600 dark:text-saffron-400">
              <Award size={14} />
              {computedPct}%
            </span>
          </div>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 font-medium">
            {t(`deficiency.${rec.deficiency_type}`)}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 pb-4">
        <p className="text-sm text-warm-700 dark:text-warm-300 leading-relaxed">
          {t(`foods.${rec.id}.description`) !== `foods.${rec.id}.description` ? t(`foods.${rec.id}.description`) : rec.description}
        </p>
      </div>

      {/* Score breakdown */}
      <div className="px-5 pb-4 space-y-2.5">
        <p className="text-xs font-semibold text-warm-500 dark:text-warm-400 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp size={12} />
          {t('recommendation.scoreBreakdown')}
        </p>
        <ScoreBar label={t('recommendation.nutrientMatch')} value={rec.nutrient_match_score} color="bg-red-400" />
        <ScoreBar label={t('recommendation.localAvailability')} value={rec.local_availability_score} color="bg-teal-400" />
        <ScoreBar label={t('recommendation.cost')} value={rec.cost_score} color="bg-amber-400" />
        <ScoreBar label={t('recommendation.shelfLife')} value={rec.shelf_life_score} color="bg-purple-400" />
      </div>

      {/* Citation */}
      <div className="px-5 pb-4">
        <div className="flex items-start gap-2 p-3 bg-warm-50 dark:bg-warm-800 rounded-xl border border-warm-100 dark:border-warm-700">
          <BookOpen size={13} className="text-warm-400 shrink-0 mt-0.5" />
          <p className="text-xs text-warm-500 dark:text-warm-400 leading-relaxed">{rec.citation}</p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 bg-warm-50 dark:bg-warm-800/50 border-t border-warm-100 dark:border-warm-700">
        <Link
          to={`/pledge/${villageId}/${rec.id}`}
          className="flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
        >
          {t('recommendation.pledgeThis')}
          <ExternalLink size={13} />
        </Link>
      </div>
    </div>
  );
}
