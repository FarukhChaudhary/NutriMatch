// src/components/NutritionAssistant.jsx
// NutriMatch Phase 2 — Stateful Natural Language AI Assistant with Active Context Badges

import React, { useState } from 'react';
import { Bot, Send, X, BookOpen, ShieldAlert, Sparkles, ChevronDown, MapPin, Package, Users, Coins, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { queryRAGKnowledge } from '../utils/ragEngine';
import { createInitialContext } from '../utils/orchestratorContext';

export default function NutritionAssistant() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [conversationContext, setConversationContext] = useState(() => createInitialContext(language));

  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'assistant',
      responseObj: {
        explanation:
          language === 'hi'
            ? 'नमस्ते! मैं NutriMatch प्राकृतिक भाषा एआई सहायक हूँ। आप मुझसे किसी भी स्थान, बजट, दान, या पोषण आंकड़े के बारे में पूछ सकते हैं।'
            : language === 'mr'
            ? 'नमस्कार! मी NutriMatch एआय सहाय्यक आहे. आपण मला कोणत्याही ठिकाणाबद्दल, बजेटबद्दल किंवा दानाबद्दल विचारू शकता.'
            : 'Hello! I am the NutriMatch AI Decision Assistant. Ask me anything about locations, budgets, food suitability, or evidence.',
        sections: null,
        evidence: null,
        technicalDetails: null,
      },
    },
  ]);

  const handleSendQuery = (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    const userText = queryInput;
    setQueryInput('');

    setChatHistory((prev) => [...prev, { sender: 'user', text: userText }]);

    setTimeout(() => {
      const ragResult = queryRAGKnowledge(userText, {
        previousContext: conversationContext,
        language: language,
      });

      if (ragResult.activeContext) {
        setConversationContext(ragResult.activeContext);
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          responseObj: ragResult,
        },
      ]);
    }, 300);
  };

  const handleClearContext = () => {
    setConversationContext(createInitialContext(language));
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-saffron-500 hover:bg-saffron-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all animate-bounce"
        >
          <Bot size={20} />
          <span>Nutrition AI Assistant</span>
        </button>
      )}

      {/* Assistant Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-lg bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-700 rounded-3xl shadow-card-hover overflow-hidden flex flex-col h-[640px] animate-slide-up">
          {/* Header */}
          <div className="bg-saffron-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot size={22} />
              <div>
                <h3 className="font-display font-bold text-base leading-tight">NutriMatch Decision AI</h3>
                <p className="text-xs text-saffron-100 flex items-center gap-1">
                  <Sparkles size={11} /> Open Natural Language Orchestrator
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-saffron-600 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Active Context Pills Bar */}
          {(conversationContext.activeLocation || conversationContext.activeBudget || conversationContext.activeInventory.length > 0) && (
            <div className="bg-saffron-50 dark:bg-saffron-950/40 border-b border-saffron-100 dark:border-saffron-900/50 px-3.5 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-saffron-800 dark:text-saffron-300">Active Context:</span>
                {conversationContext.activeLocation && (
                  <span className="bg-white dark:bg-warm-900 px-2 py-0.5 rounded-md border border-saffron-200 text-warm-900 dark:text-warm-100 font-medium flex items-center gap-1">
                    <MapPin size={10} className="text-saffron-500" /> {conversationContext.activeLocation}
                  </span>
                )}
                {conversationContext.activeBudget && (
                  <span className="bg-white dark:bg-warm-900 px-2 py-0.5 rounded-md border border-saffron-200 text-warm-900 dark:text-warm-100 font-medium flex items-center gap-1">
                    <Coins size={10} className="text-saffron-500" /> ₹{conversationContext.activeBudget.toLocaleString()}
                  </span>
                )}
                {conversationContext.activeInventory.map((item, idx) => (
                  <span key={idx} className="bg-white dark:bg-warm-900 px-2 py-0.5 rounded-md border border-saffron-200 text-warm-900 dark:text-warm-100 font-medium flex items-center gap-1">
                    <Package size={10} className="text-saffron-500" /> {item.quantity} {item.unit} {item.item_name}
                  </span>
                ))}
              </div>
              <button
                onClick={handleClearContext}
                className="text-[11px] font-semibold text-saffron-700 hover:text-saffron-900 dark:text-saffron-400 flex items-center gap-1 hover:underline ml-2"
                title="Clear Context"
              >
                <Trash2 size={11} /> Clear
              </button>
            </div>
          )}

          {/* Chat Message List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-warm-50/50 dark:bg-warm-900/50">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.sender === 'user' ? (
                  <div className="p-3.5 rounded-2xl text-sm max-w-[85%] bg-saffron-500 text-white font-medium rounded-br-none shadow-sm">
                    {msg.text}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-warm-800 text-warm-900 dark:text-warm-100 border border-warm-200 dark:border-warm-700 p-4 rounded-2xl text-sm max-w-[96%] shadow-sm rounded-bl-none space-y-3">
                    {/* Plain Explanation */}
                    <p className="font-medium leading-relaxed">{msg.responseObj?.explanation}</p>

                    {/* Structured Response Cards */}
                    {msg.responseObj?.sections && (
                      <div className="space-y-3 pt-2 border-t border-warm-100 dark:border-warm-700/70">
                        {/* Section 1: Recommended Locations */}
                        {msg.responseObj.sections.recommendedLocations && (
                          <div className="bg-saffron-50/60 dark:bg-saffron-950/30 p-3 rounded-xl border border-saffron-200 dark:border-saffron-900/50">
                            <h4 className="font-bold text-xs text-saffron-800 dark:text-saffron-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <MapPin size={13} /> Recommended Locations
                            </h4>
                            <div className="space-y-2">
                              {msg.responseObj.sections.recommendedLocations.map((loc, idx) => (
                                <div key={idx} className="bg-white dark:bg-warm-900 p-2.5 rounded-lg border border-warm-200 dark:border-warm-700">
                                  <div className="flex items-center justify-between font-semibold text-xs text-warm-900 dark:text-warm-100">
                                    <span>{loc.location}</span>
                                    <span className="text-saffron-600 font-bold">Priority: {loc.priorityScore}</span>
                                  </div>
                                  <p className="text-[11px] text-warm-500 dark:text-warm-400 mt-1">{loc.why}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Section 2: Why This Location */}
                        {msg.responseObj.sections.whyThisLocation && (
                          <div className="text-xs text-warm-700 dark:text-warm-300 bg-warm-100/60 dark:bg-warm-900/60 p-2.5 rounded-lg">
                            <strong>Why This Location?</strong> {msg.responseObj.sections.whyThisLocation}
                          </div>
                        )}

                        {/* Section 3 & 4: Estimated Reach */}
                        {msg.responseObj.sections.estimatedReach && (
                          <div className="bg-teal-50 dark:bg-teal-950/40 p-2.5 rounded-lg border border-teal-200 dark:border-teal-900/50 text-xs">
                            <span className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1">
                              <Users size={12} /> Estimated Reach
                            </span>
                            <p className="mt-1 font-semibold text-teal-900 dark:text-teal-100">
                              ~{msg.responseObj.sections.estimatedReach.beneficiaries} {msg.responseObj.sections.estimatedReach.unitLabel}
                            </p>
                          </div>
                        )}

                        {/* Section 5 & 6: Provides & Complement */}
                        {msg.responseObj.sections.whatFoodProvides && (
                          <div className="text-xs space-y-1.5 bg-warm-50 dark:bg-warm-900/40 p-2.5 rounded-lg">
                            <p><strong>Nutritional Function:</strong> {msg.responseObj.sections.whatFoodProvides}</p>
                            {msg.responseObj.sections.whatCouldComplement && (
                              <p className="text-saffron-700 dark:text-saffron-400">
                                <strong>Complementary Recommendation:</strong> {msg.responseObj.sections.whatCouldComplement}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Compact Evidence Panel */}
                    {msg.responseObj?.evidence && (
                      <div className="bg-warm-50 dark:bg-warm-900/60 p-2.5 rounded-xl text-xs space-y-1 border border-warm-200 dark:border-warm-700">
                        <span className="font-bold text-warm-700 dark:text-warm-300 flex items-center gap-1">
                          <BookOpen size={12} /> Source Evidence: {msg.responseObj.evidence.source}
                        </span>
                        <div className="text-[11px] text-warm-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          <span>Group: {msg.responseObj.evidence.populationGroup}</span>
                          <span>Level: {msg.responseObj.evidence.geographyLevel}</span>
                          <span>Year: {msg.responseObj.evidence.surveyYear}</span>
                          <span className="font-semibold text-saffron-600">Confidence: {msg.responseObj.evidence.confidence}</span>
                        </div>
                      </div>
                    )}

                    {/* Collapsible Technical Details */}
                    {msg.responseObj?.technicalDetails && (
                      <details className="mt-2 text-xs border-t border-warm-200 dark:border-warm-700 pt-2 group">
                        <summary className="cursor-pointer font-bold text-saffron-600 dark:text-saffron-400 hover:underline flex items-center gap-1 select-none">
                          <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                          {msg.responseObj.technicalDetails.toggleLabel || 'View technical details'}
                        </summary>
                        <div className="mt-2 bg-warm-900 text-warm-100 p-3 rounded-xl font-mono text-[11px] leading-relaxed space-y-1 overflow-x-auto">
                          {msg.responseObj.technicalDetails.rawFormula && (
                            <p><span className="text-saffron-400">Formula:</span> {msg.responseObj.technicalDetails.rawFormula}</p>
                          )}
                          {msg.responseObj.technicalDetails.indicatorValues && (
                            <p><span className="text-saffron-400">Values:</span> {msg.responseObj.technicalDetails.indicatorValues}</p>
                          )}
                        </div>
                      </details>
                    )}

                    {/* Disclaimer */}
                    {msg.responseObj?.disclaimer && (
                      <p className="text-[10px] text-warm-400 dark:text-warm-500 italic border-t border-warm-100 dark:border-warm-700/60 pt-1.5 flex items-center gap-1">
                        <ShieldAlert size={10} className="shrink-0" /> {msg.responseObj.disclaimer}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendQuery} className="p-3 bg-white dark:bg-warm-800 border-t border-warm-200 dark:border-warm-700 flex items-center gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={language === 'hi' ? 'कोई भी प्रश्न पूछें…' : language === 'mr' ? 'कोणताही प्रश्न विचारा…' : 'Ask any question or specify constraints…'}
              className="flex-1 px-3.5 py-2.5 bg-warm-50 dark:bg-warm-900 border border-warm-200 dark:border-warm-700 rounded-xl text-sm text-warm-900 dark:text-warm-100 focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!queryInput.trim()}
              className="p-2.5 bg-saffron-500 hover:bg-saffron-600 disabled:bg-saffron-200 text-white rounded-xl transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
