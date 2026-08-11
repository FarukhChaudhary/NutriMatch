import clsx from 'clsx';
import { AlertTriangle, Info, TrendingDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SEVERITY_CONFIG = {
  mild:     { icon: Info,          label: 'mild',     bg: 'bg-amber-100 dark:bg-amber-900/40',   text: 'text-amber-800 dark:text-amber-300',   dot: 'bg-amber-400' },
  moderate: { icon: TrendingDown,  label: 'moderate', bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-800 dark:text-orange-300', dot: 'bg-orange-500' },
  severe:   { icon: AlertTriangle, label: 'severe',   bg: 'bg-red-100 dark:bg-red-900/40',       text: 'text-red-800 dark:text-red-300',       dot: 'bg-red-500' },
};

const DEFICIENCY_CONFIG = {
  iron:      { color: 'bg-red-400',    label: 'iron' },
  vitamin_a: { color: 'bg-amber-400',  label: 'vitamin_a' },
  zinc:      { color: 'bg-green-500',  label: 'zinc' },
  iodine:    { color: 'bg-blue-400',   label: 'iodine' },
  folate:    { color: 'bg-purple-400', label: 'folate' },
};

export function SeverityBadge({ severity, className }) {
  const { t } = useLanguage();
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.mild;
  const Icon = cfg.icon;
  return (
    <span className={clsx('severity-pill', cfg.bg, cfg.text, className)}>
      <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
      {t(`common.${severity}`)}
    </span>
  );
}

export function DeficiencyDot({ type, size = 'md' }) {
  const cfg = DEFICIENCY_CONFIG[type];
  if (!cfg) return null;
  const sz = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
  return (
    <span
      className={clsx('rounded-full inline-block flex-shrink-0', cfg.color, sz)}
      title={type}
      role="img"
      aria-label={type}
    />
  );
}

export function DeficiencyBadge({ type, severity, prevalence, className }) {
  const { t } = useLanguage();
  const cfg = DEFICIENCY_CONFIG[type];
  const sevCfg = SEVERITY_CONFIG[severity];
  if (!cfg || !sevCfg) return null;

  return (
    <div className={clsx(
      'flex items-center justify-between gap-3 px-3 py-2 rounded-xl border',
      'bg-white dark:bg-warm-800 border-warm-200 dark:border-warm-700',
      className
    )}>
      <div className="flex items-center gap-2 min-w-0">
        <span className={clsx('w-3 h-3 rounded-full flex-shrink-0', cfg.color)} />
        <span className="text-sm font-medium text-warm-800 dark:text-warm-200 truncate">
          {t(`deficiency.${type}`)}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {prevalence !== undefined && (
          <span className="text-xs text-warm-500 dark:text-warm-400 font-mono">{prevalence}%</span>
        )}
        <SeverityBadge severity={severity} />
      </div>
    </div>
  );
}
