import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Term, Tm } from '../lib/qwen-api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
  customEndpoint: string;
  setCustomEndpoint: (url: string) => void;
  terms: Term[];
  setTerms: (terms: Term[]) => void;
  tmList: Tm[];
  setTmList: (tmList: Tm[]) => void;
  domainPrompt: string;
  setDomainPrompt: (prompt: string) => void;
  t: any;
}

type Tab = 'general' | 'glossary' | 'memory' | 'domain';

export function SettingsModal({
  isOpen, onClose, apiKey, setApiKey, model, setModel,
  endpoint, setEndpoint, customEndpoint, setCustomEndpoint,
  terms, setTerms, tmList, setTmList, domainPrompt, setDomainPrompt, t
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const addTerm = () => setTerms([...terms, { source: '', target: '' }]);
  const updateTerm = (index: number, field: keyof Term, value: string) => {
    const newTerms = [...terms];
    newTerms[index][field] = value;
    setTerms(newTerms);
  };
  const removeTerm = (index: number) => setTerms(terms.filter((_, i) => i !== index));

  const addTm = () => setTmList([...tmList, { source: '', target: '' }]);
  const updateTm = (index: number, field: keyof Tm, value: string) => {
    const newTmList = [...tmList];
    newTmList[index][field] = value;
    setTmList(newTmList);
  };
  const removeTm = (index: number) => setTmList(tmList.filter((_, i) => i !== index));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="vellum fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-6 z-50 flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t.settingsTitle}</h2>
              <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex gap-2 mb-6 border-b border-black/10 dark:border-white/10 pb-2 overflow-x-auto shrink-0">
              {(['general', 'glossary', 'memory', 'domain'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${
                    activeTab === tab ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  {t[tab]}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 px-1.5 pt-1 space-y-5 min-h-[300px]">
              {activeTab === 'general' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t.apiKeyLabel}
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={t.apiKeyPlaceholder}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-gray-100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      {t.apiKeyHelp}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t.modelLabel}
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none text-gray-900 dark:text-gray-100"
                    >
                      <option value="qwen-mt-flash">{t.modelFlash}</option>
                      <option value="qwen-mt-plus">{t.modelPlus}</option>
                      <option value="qwen-mt-lite">{t.modelLite}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      {t.endpointLabel}
                    </label>
                    <select
                      value={endpoint}
                      onChange={(e) => setEndpoint(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none text-gray-900 dark:text-gray-100 mb-2"
                    >
                      <option value="https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions">{t.endpointIntl}</option>
                      <option value="https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions">{t.endpointDom}</option>
                      <option value="custom">{t.endpointCustom}</option>
                    </select>
                    {endpoint === 'custom' && (
                      <input
                        type="text"
                        value={customEndpoint}
                        onChange={(e) => setCustomEndpoint(e.target.value)}
                        placeholder={t.endpointCustomPlaceholder}
                        className="w-full px-4 py-2.5 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-900 dark:text-gray-100 mt-2"
                      />
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'glossary' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t.glossaryHelp}
                    </p>
                    <button onClick={addTerm} className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                      <Plus className="w-4 h-4" /> {t.addTerm}
                    </button>
                  </div>
                  {terms.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      {t.noTerms}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {terms.map((term, index) => (
                        <div key={index} className="flex gap-3 items-start">
                          <input
                            type="text"
                            placeholder={t.sourceTerm}
                            value={term.source}
                            onChange={(e) => updateTerm(index, 'source', e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-gray-900 dark:text-gray-100"
                          />
                          <input
                            type="text"
                            placeholder={t.targetTerm}
                            value={term.target}
                            onChange={(e) => updateTerm(index, 'target', e.target.value)}
                            className="flex-1 px-3 py-2 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-gray-900 dark:text-gray-100"
                          />
                          <button onClick={() => removeTerm(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'memory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t.memoryHelp}
                    </p>
                    <button onClick={addTm} className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                      <Plus className="w-4 h-4" /> {t.addPair}
                    </button>
                  </div>
                  {tmList.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      {t.noMemory}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tmList.map((tm, index) => (
                        <div key={index} className="flex gap-3 items-start bg-black/5 dark:bg-white/5 p-3 rounded-xl">
                          <div className="flex-1 space-y-2">
                            <textarea
                              placeholder={t.sourceSentence}
                              value={tm.source}
                              onChange={(e) => updateTm(index, 'source', e.target.value)}
                              className="w-full px-3 py-2 bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none h-20 text-gray-900 dark:text-gray-100"
                            />
                            <textarea
                              placeholder={t.targetSentence}
                              value={tm.target}
                              onChange={(e) => updateTm(index, 'target', e.target.value)}
                              className="w-full px-3 py-2 bg-white/80 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none h-20 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                          <button onClick={() => removeTm(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors mt-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'domain' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.domainHelp} <br/>
                    <span className="font-medium text-amber-600 dark:text-amber-500">{t.domainNote}</span>
                  </p>
                  <textarea
                    placeholder={t.domainPlaceholder}
                    value={domainPrompt}
                    onChange={(e) => setDomainPrompt(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none h-40 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex justify-end shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
              >
                {t.done}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
