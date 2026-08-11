import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Calendar, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DeficiencyBadge } from '../components/DeficiencyBadge';
import RecommendationCard from '../components/RecommendationCard';
import { useLanguage } from '../context/LanguageContext';
import { VILLAGES, DEFICIENCY_RECORDS, getTopRecommendations, NGO_ACTIVITIES, DONOR_PLEDGES } from '../data/mockData';
import clsx from 'clsx';

const RADAR_COLORS = {
  iron: '#e57373', vitamin_a: '#ffb74d', zinc: '#81c784', iodine: '#64b5f6', folate: '#ba68c8'
};

export default function VillageDetail() {
  const { id } = useParams();
  const { t, formatNumber, formatDate } = useLanguage();

  const village = VILLAGES.find(v => v.id === id);
  if (!village) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-warm-950 flex items-center justify-center page-enter">
        <div className="text-center">
          <p className="text-warm-500 text-lg mb-4">Village not found.</p>
          <Link to="/" className="text-saffron-600 font-medium hover:underline">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const deficiencies = DEFICIENCY_RECORDS.filter(d => d.village_id === id);
  const sorted = [...deficiencies].sort((a, b) => {
    const order = { severe: 0, moderate: 1, mild: 2 };
    return order[a.severity] - order[b.severity];
  });

  const recommendations = getTopRecommendations(id);

  const activities = NGO_ACTIVITIES.filter(a => a.village_id === id);
  const activeActivities = activities.filter(a => a.status === 'active');

  const pledges = DONOR_PLEDGES.filter(p => p.village_id === id);

  // Overlap detection: multiple active NGOs on same deficiency
  const activeDefTypes = activeActivities.map(a => a.deficiency_addressed);
  const overlapDefs = activeDefTypes.filter((d, i) => activeDefTypes.indexOf(d) !== i);
  const hasOverlap = overlapDefs.length > 0;

  // Radar chart data
  const radarData = ['iron', 'vitamin_a', 'zinc', 'iodine', 'folate'].map(type => {
    const def = deficiencies.find(d => d.deficiency_type === type);
    return { subject: type.replace('_', ' '), value: def?.prevalence_pct ?? 0 };
  });

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 page-enter">
      {/* Back button + header */}
      <div className="bg-white dark:bg-warm-900 border-b border-warm-200 dark:border-warm-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            to="/villages"
            className="inline-flex items-center gap-2 text-sm text-warm-500 hover:text-saffron-600 dark:text-warm-400 dark:hover:text-saffron-400 mb-5 transition-colors"
          >
            <ArrowLeft size={16} /> {t('common.back')}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <h1 className="font-display font-bold text-3xl text-warm-900 dark:text-warm-100 mb-1">{village.name}</h1>
              <div className="flex items-center gap-2 text-warm-500 dark:text-warm-400">
                <MapPin size={15} />
                <span>{village.district}, {village.state}</span>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6 text-center">
              <div className="bg-warm-50 dark:bg-warm-800 rounded-xl px-4 py-3">
                <p className="text-2xl font-bold font-display text-warm-900 dark:text-warm-100">{formatNumber(village.population)}</p>
                <p className="text-xs text-warm-500 dark:text-warm-400">{t('common.population')}</p>
              </div>
              <div className="bg-saffron-50 dark:bg-saffron-900/20 rounded-xl px-4 py-3">
                <p className="text-2xl font-bold font-display text-saffron-700 dark:text-saffron-400">{formatNumber(village.child_population)}</p>
                <p className="text-xs text-warm-500 dark:text-warm-400">{t('common.children')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overlap alert */}
        {hasOverlap && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-2xl">
            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">{t('ngo.overlapDetected')}</p>
              <p className="text-amber-700 dark:text-amber-400 text-sm">{t('village.overlapWarning')}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                {t('village.overlappingDeficiencies')}: {overlapDefs.map(d => t(`deficiency.${d}`)).join(', ')}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: deficiency profile + radar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Deficiency profile */}
            <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5">
              <h2 className="font-display font-semibold text-warm-900 dark:text-warm-100 mb-4 flex items-center gap-2">
                <Activity size={16} className="text-saffron-500" />
                {t('village.deficiencyProfile')}
              </h2>
              <div className="space-y-2">
                {sorted.map(def => (
                  <DeficiencyBadge
                    key={def.id}
                    type={def.deficiency_type}
                    severity={def.severity}
                    prevalence={def.prevalence_pct}
                  />
                ))}
              </div>
              <p className="text-xs text-warm-400 dark:text-warm-500 mt-3 flex items-center gap-1">
                <span>{t('common.source')}:</span>
                <span className="italic">{deficiencies[0]?.source}</span>
              </p>
            </div>

            {/* Radar chart */}
            <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5">
              <h3 className="font-display font-semibold text-warm-800 dark:text-warm-200 text-sm mb-3">Prevalence Radar</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#d4d4c8" className="dark:stroke-warm-700" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#8c8c78' }} />
                    <Radar name="Prevalence" dataKey="value" fill="#f97d17" fillOpacity={0.35} stroke="#f97d17" strokeWidth={2} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Prevalence']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NGO Activity */}
            <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5">
              <h2 className="font-display font-semibold text-warm-900 dark:text-warm-100 mb-4">{t('village.ngoActivity')}</h2>
              {activities.length === 0 ? (
                <p className="text-sm text-warm-400 dark:text-warm-500">{t('village.noActivity')}</p>
              ) : (
                <div className="space-y-3">
                  {activities.map(a => (
                    <div key={a.id} className="flex items-start gap-3">
                      <div className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', a.status === 'active' ? 'bg-teal-500' : 'bg-warm-300')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-warm-800 dark:text-warm-200 truncate">{a.item_distributed}</p>
                        <p className="text-xs text-warm-500 dark:text-warm-400">{formatDate(a.start_date)} — {a.end_date ? formatDate(a.end_date) : 'Ongoing'}</p>
                        {a.notes && <p className="text-xs text-warm-400 dark:text-warm-500 mt-0.5 italic">{a.notes}</p>}
                      </div>
                      <span className={clsx(
                        'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                        a.status === 'active' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400' : 'bg-warm-100 text-warm-600 dark:bg-warm-700 dark:text-warm-400'
                      )}>
                        {t(`common.${a.status}`)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pledges */}
            <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5">
              <h2 className="font-display font-semibold text-warm-900 dark:text-warm-100 mb-4">{t('village.donorActivity')}</h2>
              {pledges.length === 0 ? (
                <p className="text-sm text-warm-400 dark:text-warm-500">{t('village.noPledges')}</p>
              ) : (
                <div className="space-y-2">
                  {pledges.map(p => (
                    <div key={p.id} className="flex items-center justify-between gap-2 text-sm py-2 border-b border-warm-100 dark:border-warm-800 last:border-0">
                      <div>
                        {p.amount_inr ? <span className="font-medium text-teal-600 dark:text-teal-400">₹{p.amount_inr.toLocaleString('en-IN')}</span> : <span className="text-warm-700 dark:text-warm-300">{p.item_description}</span>}
                        <p className="text-xs text-warm-400">{formatDate(p.date)}</p>
                      </div>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full', p.status === 'fulfilled' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400')}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Recommendations */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-2xl text-warm-900 dark:text-warm-100">{t('recommendation.title')}</h2>
                <p className="text-sm text-warm-500 dark:text-warm-400 mt-1">{t('recommendation.subtitle')}</p>
              </div>
            </div>
            {recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700">
                <CheckCircle size={36} className="text-teal-400 mb-3" />
                <p className="text-warm-500 dark:text-warm-400">{t('common.noData')}</p>
              </div>
            ) : (
              <div className="space-y-5">
                {recommendations.map((rec, i) => (
                  <RecommendationCard key={rec.id} rec={rec} rank={i + 1} villageId={id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
