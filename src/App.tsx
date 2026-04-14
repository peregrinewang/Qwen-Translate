import React, { useState, useEffect, useCallback, memo } from 'react';
import { Settings, History, ArrowRightLeft, Copy, Check, AlertCircle, Loader2, X, Sun, Moon, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { languages } from './lib/languages';
import { translateText, Term, Tm } from './lib/qwen-api';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SettingsModal } from './components/SettingsModal';
import { HistorySidebar, HistoryItem } from './components/HistorySidebar';
import { VellumSelect } from './components/VellumSelect';
import { i18n } from './lib/i18n';

const BackgroundBlobs = memo(function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[0%] left-[0%] w-[65vw] h-[65vw] -translate-x-1/4 -translate-y-1/4 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12)_0%,transparent_65%)] dark:bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0%,transparent_65%)] animate-[blob-drift-1_20s_ease-in-out_infinite]" />
      <div className="absolute bottom-[0%] right-[0%] w-[70vw] h-[70vw] translate-x-1/4 translate-y-1/4 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15)_0%,transparent_65%)] dark:bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_65%)] animate-[blob-drift-2_24s_ease-in-out_infinite]" />
    </div>
  );
});

export default function App() {
  const [uiLang, setUiLang] = useLocalStorage<'en' | 'zh'>('qwen_ui_lang', 'en');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('qwen_theme', 'light');
  const t = i18n[uiLang];

  const [sourceLang, setSourceLang] = useLocalStorage('qwen_source_lang', 'auto');
  const [targetLang, setTargetLang] = useLocalStorage('qwen_target_lang', 'en');
  const [apiKey, setApiKey] = useLocalStorage('qwen_api_key', '');
  const [model, setModel] = useLocalStorage('qwen_model', 'qwen-mt-flash');
  const [endpoint, setEndpoint] = useLocalStorage('qwen_endpoint', 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions');
  const [customEndpoint, setCustomEndpoint] = useLocalStorage('qwen_custom_endpoint', '');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('qwen_history', []);

  const [terms, setTerms] = useLocalStorage<Term[]>('qwen_terms', []);
  const [tmList, setTmList] = useLocalStorage<Tm[]>('qwen_tm_list', []);
  const [domainPrompt, setDomainPrompt] = useLocalStorage<string>('qwen_domain_prompt', '');

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleTranslate = async () => {
    const text = inputText.trim();

    if (!text) {
      setOutputText('');
      setError(null);
      return;
    }

    if (!apiKey) {
      setError(t.apiMissing);
      setIsSettingsOpen(true);
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const targetEndpoint = endpoint === 'custom' ? customEndpoint : endpoint;
      const result = await translateText(
        text,
        sourceLang,
        targetLang,
        apiKey,
        model,
        targetEndpoint,
        { terms, tmList, domainPrompt }
      );
      setOutputText(result);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        sourceLang,
        targetLang,
        inputText: text,
        outputText: result,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newHistoryItem, ...prev].slice(0, 50));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.translationFailed);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      setSourceLang(targetLang);
      setTargetLang('en'); // Default fallback
    } else {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleRestoreHistory = useCallback((item: HistoryItem) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setInputText(item.inputText);
    setOutputText(item.outputText);
    setIsHistoryOpen(false);
  }, [setSourceLang, setTargetLang, setInputText, setOutputText]);

  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const closeHistory = useCallback(() => setIsHistoryOpen(false), []);
  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  const getLangName = (lang: any) => uiLang === 'zh' && lang.nameZh ? lang.nameZh : lang.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-300/40 dark:selection:bg-blue-500/40 transition-colors duration-500 flex flex-col items-center">
      
      <BackgroundBlobs />

      <div className="relative w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col flex-1">
        
        {/* ── Header ── */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <motion.img 
              whileHover={{ rotate: 5, scale: 1.05 }}
              src="https://img.alicdn.com/imgextra/i2/O1CN01B9mlGG1msAz3fxxWL_!!6000000005009-2-tps-84-84.png"
              alt="Qwen Logo"
              className="w-11 h-11 rounded-2xl shadow-lg shadow-blue-500/20 object-cover"
            />
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 flex items-center">
              {t.title}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { icon: Languages, onClick: () => setUiLang(uiLang === 'en' ? 'zh' : 'en'), title: uiLang === 'en' ? 'Switch to Chinese' : '切换到英文' },
              { icon: theme === 'light' ? Moon : Sun, onClick: () => setTheme(theme === 'light' ? 'dark' : 'light'), title: theme === 'light' ? 'Dark Mode' : 'Light Mode' },
              { icon: History, onClick: () => setIsHistoryOpen(true), title: t.history },
              { icon: Settings, onClick: () => setIsSettingsOpen(true), title: t.settings }
            ].map((btn, i) => {
              const Icon = btn.icon;
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={btn.onClick}
                  className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center shrink-0"
                  title={btn.title}
                >
                  <Icon className="w-[22px] h-[22px]" />
                </motion.button>
              )
            })}
          </div>
        </header>

        {/* ── Main Translator Interface ── */}
        <main className="w-full flex-1 flex flex-col">
          <div className="vellum relative flex flex-col overflow-hidden">
            
            {/* Language Selectors Bar */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-black/[0.04] dark:border-white/[0.08] bg-white/[0.15] dark:bg-black/[0.15]">
              <div className="flex-1 flex justify-center">
                <VellumSelect
                  value={sourceLang}
                  onChange={(val) => setSourceLang(val)}
                  className="w-full max-w-[220px]"
                  buttonClassName="bg-transparent text-gray-800 dark:text-gray-200 px-4 py-2.5 text-center"
                  options={languages.map((lang) => ({ value: lang.code, label: getLangName(lang) }))}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', damping: 15 }}
                onClick={handleSwapLanguages}
                className="p-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-full transition-colors mx-3 shrink-0"
                title={t.swapLanguages}
              >
                <ArrowRightLeft className="w-[18px] h-[18px]" />
              </motion.button>

              <div className="flex-1 flex justify-center">
                <VellumSelect
                  value={targetLang}
                  onChange={(val) => setTargetLang(val)}
                  className="w-full max-w-[220px]"
                  buttonClassName="bg-transparent text-gray-800 dark:text-gray-200 px-4 py-2.5 text-center"
                  options={languages.filter(l => l.code !== 'auto').map((lang) => ({ value: lang.code, label: getLangName(lang) }))}
                />
              </div>
            </div>

            {/* Translate Button Strip */}
            <div className="flex justify-end px-5 py-3 border-b border-black/[0.04] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.01]">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
                className="glow-btn inline-flex items-center justify-center gap-2 px-7 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-blue-400 disabled:to-cyan-300 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all w-full sm:w-auto"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.translating}</span>
                  </>
                ) : (
                  <span>{t.translate}</span>
                )}
              </motion.button>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50/80 dark:bg-red-500/10 border-b border-red-100 dark:border-red-500/20 overflow-hidden"
                >
                  <div className="px-6 py-3.5 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Text Areas Section (Split Layout) */}
            <div className="flex flex-col md:flex-row flex-1 min-h-[420px]">
              
              {/* --- Input Area --- */}
              <div className="flex-1 flex flex-col p-6 border-b md:border-b-0 md:border-r border-black/[0.04] dark:border-white/[0.08] relative group">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="flex-1 w-full bg-transparent resize-none outline-none text-[1.35rem] leading-relaxed text-gray-800 dark:text-gray-100 placeholder-gray-400/80 dark:placeholder-gray-500/80"
                  spellCheck="false"
                />
                
                <AnimatePresence>
                  {inputText && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setInputText('')}
                      className="absolute bottom-5 right-5 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white/70 hover:bg-white dark:bg-black/30 dark:hover:bg-black/50 rounded-xl shadow-sm transition-colors flex items-center opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-xs font-medium px-1.5">{t.clear}</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* --- Output Area --- */}
              {/* Very subtle background change to differentiate source and target */}
              <div className="flex-1 flex flex-col p-6 bg-blue-50/10 dark:bg-blue-900/[0.02] relative group">
                {isTranslating && (
                  <div className="absolute top-6 right-6">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      <Loader2 className="w-[22px] h-[22px] text-blue-500" />
                    </motion.div>
                  </div>
                )}
                
                <div className="flex-1 w-full text-[1.35rem] leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">
                  {outputText ? (
                    outputText
                  ) : (
                    <span className="text-gray-400/70 dark:text-gray-500/70 select-none">
                      {t.outputPlaceholder}
                    </span>
                  )}
                </div>
                
                {/* Output Bottom Actions */}
                <div className="mt-4 flex flex-row items-center justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: outputText ? 1.05 : 1 }}
                    whileTap={{ scale: outputText ? 0.95 : 1 }}
                    onClick={handleCopy}
                    disabled={!outputText}
                    className="flex items-center gap-1.5 px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-white/60 dark:hover:bg-black/30 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed group-hover:opacity-100 opacity-60"
                    title={t.copy}
                  >
                    {copied ? (
                      <>
                        <Check className="w-[18px] h-[18px] text-green-500" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-[18px] h-[18px]" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

            </div>
          </div>
        </main>

        <footer className="mt-10 mb-4 text-center">
          <p className="text-[13px] font-medium tracking-wide text-gray-400/80 dark:text-gray-500/80 uppercase">
            {t.poweredBy}
          </p>
        </footer>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        apiKey={apiKey}
        setApiKey={setApiKey}
        model={model}
        setModel={setModel}
        endpoint={endpoint}
        setEndpoint={setEndpoint}
        customEndpoint={customEndpoint}
        setCustomEndpoint={setCustomEndpoint}
        terms={terms}
        setTerms={setTerms}
        tmList={tmList}
        setTmList={setTmList}
        domainPrompt={domainPrompt}
        setDomainPrompt={setDomainPrompt}
        t={t}
      />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={closeHistory}
        history={history}
        onClear={clearHistory}
        onRestore={handleRestoreHistory}
        t={t}
        uiLang={uiLang}
      />
    </div>
  );
}
