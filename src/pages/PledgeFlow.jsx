import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, CheckCircle, Users, BookOpen, Coins, Package } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { VILLAGES, DEFICIENCY_RECORDS, FOOD_RECOMMENDATIONS, getTopRecommendations } from '../data/mockData';
import clsx from 'clsx';

const DEFICIENCY_LABELS = { iron: 'Iron', vitamin_a: 'Vitamin A', zinc: 'Zinc', iodine: 'Iodine', folate: 'Folate' };

export default function PledgeFlow() {
  const { villageId, recommendationId } = useParams();
  const { t, formatNumber, formatCurrency } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const village = VILLAGES.find(v => v.id === villageId);
  const recommendations = getTopRecommendations(villageId);
  const selectedRec = recommendationId
    ? FOOD_RECOMMENDATIONS.find(r => r.id === recommendationId)
    : recommendations[0];

  const [step, setStep] = useState(1); // 1 = select rec, 2 = pledge form, 3 = impact summary
  const [chosenRec, setChosenRec] = useState(selectedRec ?? recommendations[0]);
  const [pledgeType, setPledgeType] = useState('amount'); // 'amount' | 'item'
  const [amount, setAmount] = useState('');
  const [item, setItem] = useState('');
  const [loading, setLoading] = useState(false);

  if (!village) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-warm-950">
        <p className="text-warm-500">Village not found. <Link to="/donate" className="text-saffron-600 hover:underline">Go back</Link></p>
      </div>
    );
  }

  const defs = DEFICIENCY_RECORDS.filter(d => d.village_id === villageId);
  const topDef = defs.sort((a, b) => ({ severe: 0, moderate: 1, mild: 2 }[a.severity] - { severe: 0, moderate: 1, mild: 2 }[b.severity]))[0];

  const handleSubmitPledge = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setStep(3);
  };

  const estimatedChildren = chosenRec && amount
    ? Math.round((parseFloat(amount) / 250) * 30)
    : 45;

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 page-enter">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/donate')}
          className="inline-flex items-center gap-2 text-sm text-warm-500 hover:text-saffron-600 dark:text-warm-400 mb-6 transition-colors">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        {/* Progress */}
        {step < 3 && (
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map(s => (
              <div key={s} className={clsx('flex-1 h-1.5 rounded-full transition-all', s <= step ? 'bg-saffron-500' : 'bg-warm-200 dark:bg-warm-700')} />
            ))}
          </div>
        )}

        {/* Village context */}
        <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-saffron-100 dark:bg-saffron-900/30 flex items-center justify-center flex-shrink-0">
              <Heart size={18} className="text-saffron-600 dark:text-saffron-400" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-warm-900 dark:text-warm-100">{village.name}, {village.district}</h2>
              <p className="text-sm text-warm-500 dark:text-warm-400">{village.state} · {formatNumber(village.child_population)} children</p>
            </div>
          </div>
          {topDef && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-warm-50 dark:bg-warm-800 rounded-xl text-sm">
              <BookOpen size={14} className="text-warm-400 mt-0.5 flex-shrink-0" />
              <p className="text-warm-600 dark:text-warm-400">
                <strong>{topDef.prevalence_pct}%</strong> {t('common.children')} — {t(`deficiency.${topDef.deficiency_type}`)} ({t('common.source')}: {defs[0]?.source}).
              </p>
            </div>
          )}
        </div>

        {/* Step 1: Choose recommendation */}
        {step === 1 && (
          <div>
            <h1 className="font-display font-bold text-2xl text-warm-900 dark:text-warm-100 mb-1">{t('recommendation.title')}</h1>
            <p className="text-warm-500 dark:text-warm-400 text-sm mb-6">{t('recommendation.subtitle')}</p>
            <div className="space-y-3 mb-6">
              {recommendations.map((rec, i) => (
                <button
                  key={rec.id}
                  onClick={() => setChosenRec(rec)}
                  className={clsx(
                    'w-full text-left p-5 rounded-2xl border-2 transition-all',
                    chosenRec?.id === rec.id
                      ? 'border-saffron-400 bg-saffron-50 dark:bg-saffron-900/20 dark:border-saffron-600'
                      : 'border-warm-200 dark:border-warm-700 bg-white dark:bg-warm-900 hover:border-warm-300'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className={clsx(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                      i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-slate-300 text-slate-800' : 'bg-amber-600 text-amber-100'
                    )}>#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-warm-900 dark:text-warm-100">
                        {t(`foods.${rec.id}.name`) !== `foods.${rec.id}.name` ? t(`foods.${rec.id}.name`) : rec.food_name}
                      </p>
                      <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5 line-clamp-2">
                        {t(`foods.${rec.id}.description`) !== `foods.${rec.id}.description` ? t(`foods.${rec.id}.description`) : rec.description}
                      </p>
                      <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-400">
                        {t(`deficiency.${rec.deficiency_type}`)}
                      </span>
                    </div>
                    {chosenRec?.id === rec.id && (
                      <CheckCircle size={18} className="text-saffron-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!chosenRec}
              className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 disabled:bg-saffron-200 text-white rounded-xl font-semibold transition-colors shadow-sm"
            >
              {t('common.submit')} →
            </button>
          </div>
        )}

        {/* Step 2: Pledge details */}
        {step === 2 && (
          <div>
            <h1 className="font-display font-bold text-2xl text-warm-900 dark:text-warm-100 mb-1">{t('donor.pledge')}</h1>
            <p className="text-warm-500 dark:text-warm-400 text-sm mb-6">{village.name}</p>

            {/* Chosen rec summary */}
            <div className="bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-200 dark:border-saffron-800 rounded-2xl p-4 mb-5">
              <p className="text-xs font-semibold text-saffron-700 dark:text-saffron-400 uppercase tracking-wider mb-1">{t('donor.pledgeRecommendation')}</p>
              <p className="font-semibold text-warm-900 dark:text-warm-100">
                {t(`foods.${chosenRec?.id}.name`) !== `foods.${chosenRec?.id}.name` ? t(`foods.${chosenRec?.id}.name`) : chosenRec?.food_name}
              </p>
              <p className="text-xs text-warm-500 dark:text-warm-400 mt-0.5">
                {t(`deficiency.${chosenRec?.deficiency_type}`)}
              </p>
            </div>

            <form onSubmit={handleSubmitPledge} className="space-y-5">
              {/* Pledge type toggle */}
              <div>
                <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-2">How would you like to contribute?</label>
                <div className="flex bg-warm-100 dark:bg-warm-800 rounded-xl p-1">
                  <button type="button" onClick={() => setPledgeType('amount')}
                    className={clsx('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all', pledgeType === 'amount' ? 'bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-100 shadow-sm' : 'text-warm-500')}>
                    <Coins size={15} /> Money (INR)
                  </button>
                  <button type="button" onClick={() => setPledgeType('item')}
                    className={clsx('flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all', pledgeType === 'item' ? 'bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-100 shadow-sm' : 'text-warm-500')}>
                    <Package size={15} /> Food/Item
                  </button>
                </div>
              </div>

              {pledgeType === 'amount' ? (
                <div>
                  <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('donor.pledgeAmount')}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-400 font-medium">₹</span>
                    <input type="number" min="100" required={pledgeType === 'amount'}
                      value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder="500"
                      className="w-full pl-8 pr-4 py-3 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent" />
                  </div>
                  {/* Quick amounts */}
                  <div className="flex gap-2 mt-2">
                    {[500, 1000, 2500, 5000].map(a => (
                      <button key={a} type="button" onClick={() => setAmount(String(a))}
                        className={clsx('flex-1 py-1.5 text-xs rounded-lg border transition-colors font-medium',
                          amount === String(a) ? 'bg-saffron-100 border-saffron-300 text-saffron-700 dark:bg-saffron-900/30 dark:border-saffron-700 dark:text-saffron-400' : 'border-warm-200 dark:border-warm-700 text-warm-600 dark:text-warm-400 hover:bg-warm-50 dark:hover:bg-warm-800')}>
                        ₹{a.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-warm-700 dark:text-warm-300 mb-1.5">{t('donor.pledgeItem')}</label>
                  <input type="text" required={pledgeType === 'item'}
                    value={item} onChange={e => setItem(e.target.value)}
                    placeholder={`e.g. 20kg Fortified Rice`}
                    className="w-full px-4 py-3 bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent" />
                </div>
              )}

              {!user && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-400">
                  You're pledging as a guest. <Link to="/login" className="font-semibold underline">Log in</Link> to track your pledges.
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-saffron-500 hover:bg-saffron-600 disabled:bg-saffron-300 text-white rounded-xl font-semibold text-base transition-colors shadow-sm flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="animate-pulse-soft">Processing…</span></>
                ) : (
                  <><Heart size={17} /> Confirm Pledge</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Impact summary */}
        {step === 3 && (
          <div className="text-center animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-teal-500" />
            </div>
            <h1 className="font-display font-bold text-2xl text-warm-900 dark:text-warm-100 mb-2">{t('donor.pledgeConfirmed')} 🙏</h1>
            <p className="text-warm-500 dark:text-warm-400 text-sm mb-8">{t('donor.pledgeNote')}</p>

            {/* Impact card */}
            <div className="bg-gradient-to-br from-teal-50 to-saffron-50 dark:from-teal-900/20 dark:to-saffron-900/20 border border-warm-200 dark:border-warm-700 rounded-2xl p-6 mb-6 text-left">
              <h3 className="font-display font-semibold text-warm-900 dark:text-warm-100 text-lg mb-4">{t('donor.impactSummary')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-600 dark:text-warm-400">Children helped</p>
                    <p className="font-display font-bold text-2xl text-warm-900 dark:text-warm-100">~{estimatedChildren}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-saffron-100 dark:bg-saffron-900/40 flex items-center justify-center flex-shrink-0">
                    <Heart size={16} className="text-saffron-600 dark:text-saffron-400" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-600 dark:text-warm-400">Village</p>
                    <p className="font-semibold text-warm-900 dark:text-warm-100">{village.name}, {village.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-600 dark:text-warm-400">Supporting</p>
                    <p className="font-semibold text-warm-900 dark:text-warm-100">{chosenRec?.food_name}</p>
                    <p className="text-xs text-warm-400 dark:text-warm-500">for {DEFICIENCY_LABELS[chosenRec?.deficiency_type]} deficiency</p>
                  </div>
                </div>
                {amount && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                      <Coins size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-warm-600 dark:text-warm-400">Amount pledged</p>
                      <p className="font-display font-bold text-xl text-warm-900 dark:text-warm-100">{formatCurrency(parseFloat(amount))}</p>
                    </div>
                  </div>
                )}
                {item && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-warm-600 dark:text-warm-400">Item pledged</p>
                      <p className="font-semibold text-warm-900 dark:text-warm-100">{item}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/donate"
                className="flex-1 py-3 border border-warm-200 dark:border-warm-700 rounded-xl text-sm font-medium text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors">
                Browse More Villages
              </Link>
              <Link to="/"
                className="flex-1 py-3 bg-saffron-500 hover:bg-saffron-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm text-center">
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
