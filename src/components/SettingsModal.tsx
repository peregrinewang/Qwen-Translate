import React, { useState, memo } from 'react';
import { X, Plus, Trash2, Settings2, BookOpen, Brain, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Term, Tm } from '../lib/qwen-api';
import { VellumSelect } from './VellumSelect';

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

const tabMeta: Record<Tab, { icon: React.ElementType }> = {
  general:  { icon: Settings2 },
  glossary: { icon: BookOpen },
  memory:   { icon: Brain },
  domain:   { icon: Globe },
};

export const SettingsModal = memo(function SettingsModal({
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

  /* Shared input class string */
  const inputCls =
    'w-full min-w-0 px-4 py-3 bg-white/50 dark:bg-white/5 border border-black/8 dark:border-white/10 rounded-2xl ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/60 ' +
    'transition-all text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500';

  const smallInputCls =
    'flex-1 min-w-0 px-3.5 py-2.5 bg-white/50 dark:bg-white/5 border border-black/8 dark:border-white/10 rounded-xl ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400/60 ' +
    'transition-all text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/25 dark:bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="vellum fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-2xl z-50 flex flex-col max-h-[85vh]"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-7 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md shadow-blue-500/20 flex items-center justify-center">
                  <Settings2 className="w-[18px] h-[18px] text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                  {t.settingsTitle}
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </motion.button>
            </div>

            {/* ── Tab Bar ── */}
            <div className="flex gap-1.5 mx-7 mb-1 p-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl shrink-0">
              {(['general', 'glossary', 'memory', 'domain'] as Tab[]).map((tab) => {
                const Icon = tabMeta[tab].icon;
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{t[tab]}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Tab Content (Scrollable) ── */}
            <div className="overflow-y-auto flex-1 px-7 py-5 min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >

                  {/* ─── General Tab ─── */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      {/* API Key */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          {t.apiKeyLabel}
                        </label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder={t.apiKeyPlaceholder}
                          className={inputCls}
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
                          {t.apiKeyHelp}
                        </p>
                      </div>

                      {/* Model */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          {t.modelLabel}
                        </label>
                        <VellumSelect
                          value={model}
                          onChange={setModel}
                          className="w-full"
                          buttonClassName={inputCls}
                          options={[
                            { value: 'qwen-mt-flash', label: t.modelFlash },
                            { value: 'qwen-mt-plus', label: t.modelPlus },
                            { value: 'qwen-mt-lite', label: t.modelLite }
                          ]}
                        />
                      </div>

                      {/* Endpoint */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                          {t.endpointLabel}
                        </label>
                        <VellumSelect
                          value={endpoint}
                          onChange={setEndpoint}
                          className="w-full"
                          buttonClassName={inputCls}
                          options={[
                            { value: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', label: t.endpointIntl },
                            { value: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', label: t.endpointDom },
                            { value: 'custom', label: t.endpointCustom }
                          ]}
                        />
                        {endpoint === 'custom' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <input
                              type="text"
                              value={customEndpoint}
                              onChange={(e) => setCustomEndpoint(e.target.value)}
                              placeholder={t.endpointCustomPlaceholder}
                              className={inputCls + ' mt-3'}
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── Glossary Tab ─── */}
                  {activeTab === 'glossary' && (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                          {t.glossaryHelp}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={addTerm}
                          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-500/10 px-3.5 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors shrink-0"
                        >
                          <Plus className="w-4 h-4" /> {t.addTerm}
                        </motion.button>
                      </div>

                      {terms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-300 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                          <BookOpen className="w-10 h-10 mb-3 opacity-50" />
                          <p className="text-sm">{t.noTerms}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {terms.map((term, index) => (
                            <motion.div
                              key={index}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-2.5 items-center"
                            >
                              <input
                                type="text"
                                placeholder={t.sourceTerm}
                                value={term.source}
                                onChange={(e) => updateTerm(index, 'source', e.target.value)}
                                className={smallInputCls}
                              />
                              <span className="text-gray-300 dark:text-gray-600 text-lg shrink-0">→</span>
                              <input
                                type="text"
                                placeholder={t.targetTerm}
                                value={term.target}
                                onChange={(e) => updateTerm(index, 'target', e.target.value)}
                                className={smallInputCls}
                              />
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeTerm(index)}
                                className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Translation Memory Tab ─── */}
                  {activeTab === 'memory' && (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                          {t.memoryHelp}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={addTm}
                          className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-500/10 px-3.5 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors shrink-0"
                        >
                          <Plus className="w-4 h-4" /> {t.addPair}
                        </motion.button>
                      </div>

                      {tmList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-300 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                          <Brain className="w-10 h-10 mb-3 opacity-50" />
                          <p className="text-sm">{t.noMemory}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {tmList.map((tm, index) => (
                            <motion.div
                              key={index}
                              layout
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-3 items-start bg-black/[0.03] dark:bg-white/[0.04] p-4 rounded-2xl"
                            >
                              <div className="flex-1 min-w-0 space-y-2.5">
                                <textarea
                                  placeholder={t.sourceSentence}
                                  value={tm.source}
                                  onChange={(e) => updateTm(index, 'source', e.target.value)}
                                  className={inputCls + ' resize-none h-20'}
                                />
                                <textarea
                                  placeholder={t.targetSentence}
                                  value={tm.target}
                                  onChange={(e) => updateTm(index, 'target', e.target.value)}
                                  className={inputCls + ' resize-none h-20'}
                                />
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeTm(index)}
                                className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors shrink-0 mt-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── Domain Tab ─── */}
                  {activeTab === 'domain' && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                          {t.domainHelp}
                        </p>
                        <div className="flex items-start gap-2 px-3.5 py-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 rounded-xl">
                          <Globe className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                            {t.domainNote}
                          </p>
                        </div>
                      </div>
                      <textarea
                        placeholder={t.domainPlaceholder}
                        value={domainPrompt}
                        onChange={(e) => setDomainPrompt(e.target.value)}
                        className={inputCls + ' resize-none h-44'}
                      />
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div className="px-7 pb-6 pt-4 border-t border-black/5 dark:border-white/[0.06] flex justify-end shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="glow-btn px-7 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all"
              >
                {t.done}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
