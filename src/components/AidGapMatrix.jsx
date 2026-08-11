// src/components/AidGapMatrix.jsx
// NutriMatch Phase 2 Signature Visualizer — Nutrition Need vs Aid Gap Matrix

import React from 'react';
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { buildAidGapMatrix } from '../utils/aidGapEngine';
import { VILLAGES, DEFICIENCY_RECORDS, NGO_ACTIVITIES, DONOR_PLEDGES } from '../data/mockData';

export default function AidGapMatrix({ onSelectVillage }) {
  const { t } = useLanguage();
  const matrix = buildAidGapMatrix(VILLAGES, DEFICIENCY_RECORDS, NGO_ACTIVITIES, DONOR_PLEDGES);

  return (
    <div className="bg-white dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-bold text-xl text-warm-900 dark:text-warm-100 flex items-center gap-2">
            <ShieldAlert size={20} className="text-saffron-500" />
            Nutrition Need vs. Aid Gap Matrix
          </h2>
          <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
            Prioritizes regions with high nutrition burden and low current aid coverage.
          </p>
        </div>
      </div>

      {/* 2x2 Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quadrant 1: CRITICAL (High Need + Low Aid) */}
        <div className="bg-red-50/70 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wider">
              <AlertCircle size={14} />
              CRITICAL NEED (High Need + Low Aid)
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-200 text-red-800 dark:bg-red-900/60 dark:text-red-200">
              {matrix.CRITICAL.length} Villages
            </span>
          </div>
          <div className="space-y-2">
            {matrix.CRITICAL.map(item => (
              <div
                key={item.villageId}
                onClick={() => onSelectVillage && onSelectVillage(item.villageId)}
                className="bg-white dark:bg-warm-900 border border-red-200 dark:border-red-900/50 rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-warm-900 dark:text-warm-100">{item.villageName} ({item.district})</span>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">Need Score: {item.priorityScore}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-warm-500">
                  <span>Aid Coverage: {item.aidCoveragePct}%</span>
                  <span className="font-semibold text-amber-600">Aid Gap: {item.aidGapPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 2: MONITOR (High Need + High Aid) */}
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              <ShieldAlert size={14} />
              MONITOR (High Need + High Aid)
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
              {matrix.MONITOR.length} Villages
            </span>
          </div>
          <div className="space-y-2">
            {matrix.MONITOR.map(item => (
              <div
                key={item.villageId}
                onClick={() => onSelectVillage && onSelectVillage(item.villageId)}
                className="bg-white dark:bg-warm-900 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-warm-900 dark:text-warm-100">{item.villageName} ({item.district})</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Need Score: {item.priorityScore}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-warm-500">
                  <span>Aid Coverage: {item.aidCoveragePct}%</span>
                  <span>Active NGOs: {item.activeInterventionCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 3: OPPORTUNITY (Low Need + Low Aid) */}
        <div className="bg-teal-50/70 dark:bg-teal-950/30 border-2 border-teal-300 dark:border-teal-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
              <Sparkles size={14} />
              OPPORTUNITY (Low Need + Low Aid)
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-200 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">
              {matrix.OPPORTUNITY.length} Villages
            </span>
          </div>
          <div className="space-y-2">
            {matrix.OPPORTUNITY.map(item => (
              <div
                key={item.villageId}
                onClick={() => onSelectVillage && onSelectVillage(item.villageId)}
                className="bg-white dark:bg-warm-900 border border-teal-200 dark:border-teal-900/50 rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-warm-900 dark:text-warm-100">{item.villageName} ({item.district})</span>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Need Score: {item.priorityScore}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-warm-500">
                  <span>Aid Coverage: {item.aidCoveragePct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 4: POSSIBLE OVERALLOCATION (Low Need + High Aid) */}
        <div className="bg-purple-50/70 dark:bg-purple-950/30 border-2 border-purple-300 dark:border-purple-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              <CheckCircle2 size={14} />
              POSSIBLE OVERALLOCATION
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200">
              {matrix.POSSIBLE_OVERALLOCATION.length} Villages
            </span>
          </div>
          <div className="space-y-2">
            {matrix.POSSIBLE_OVERALLOCATION.length === 0 ? (
              <p className="text-xs text-purple-600 dark:text-purple-400 italic">No overallocated villages detected.</p>
            ) : (
              matrix.POSSIBLE_OVERALLOCATION.map(item => (
                <div
                  key={item.villageId}
                  onClick={() => onSelectVillage && onSelectVillage(item.villageId)}
                  className="bg-white dark:bg-warm-900 border border-purple-200 dark:border-purple-900/50 rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-warm-900 dark:text-warm-100">{item.villageName} ({item.district})</span>
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Need Score: {item.priorityScore}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
