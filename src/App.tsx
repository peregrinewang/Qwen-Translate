import React, { useState, useEffect } from 'react';
import { Settings, History, ArrowRightLeft, Copy, Check, AlertCircle, Loader2, X, Sun, Moon, Languages } from 'lucide-react';
import { motion } from 'motion/react';
import { languages } from './lib/languages';
import { translateText, Term, Tm } from './lib/qwen-api';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SettingsModal } from './components/SettingsModal';
import { HistorySidebar, HistoryItem } from './components/HistorySidebar';
import { i18n } from './lib/i18n';

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

  const handleRestoreHistory = (item: HistoryItem) => {
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setInputText(item.inputText);
    setOutputText(item.outputText);
    setIsHistoryOpen(false);
  };

  const getLangName = (lang: any) => uiLang === 'zh' && lang.nameZh ? lang.nameZh : lang.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-300">
      {/* Background decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white font-bold text-xl">
              Q
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-800 dark:text-gray-100">{t.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUiLang(uiLang === 'en' ? 'zh' : 'en')}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all"
              title={uiLang === 'en' ? 'Switch to Chinese' : '切换到英文'}
            >
              <Languages className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all"
              title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all"
              title={t.history}
            >
              <History className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all"
              title={t.settings}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Translator UI */}
        <main className="flex-1 flex flex-col">
          <div className="vellum relative flex flex-col overflow-hidden">
            
            {/* Language Selectors Bar */}
            <div className="flex items-center justify-between p-2 border-b border-black/5 dark:border-white/10 bg-white/20 dark:bg-black/20">
              <div className="flex-1 flex justify-center">
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="bg-transparent text-gray-700 dark:text-gray-200 font-medium px-4 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer text-center w-full max-w-[200px]"
                >
                  {languages.map((lang) => (
                    <option key={`src-${lang.code}`} value={lang.code} className="text-gray-900">
                      {getLangName(lang)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSwapLanguages}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors mx-2"
                title={t.swapLanguages}
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 flex justify-center">
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-transparent text-gray-700 dark:text-gray-200 font-medium px-4 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer text-center w-full max-w-[200px]"
                >
                  {languages.filter(l => l.code !== 'auto').map((lang) => (
                    <option key={`tgt-${lang.code}`} value={lang.code} className="text-gray-900">
                      {getLangName(lang)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end px-4 py-3 border-b border-black/5 dark:border-white/10 bg-white/10 dark:bg-black/10">
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400/70 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                {isTranslating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isTranslating ? t.translating : t.translate}</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="bg-red-50/80 dark:bg-red-900/40 border-b border-red-100 dark:border-red-800 px-6 py-3 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Text Areas */}
            <div className="flex flex-col md:flex-row flex-1 min-h-[400px]">
              {/* Input Area */}
              <div className="flex-1 flex flex-col p-6 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/10 relative group">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="flex-1 w-full bg-transparent resize-none outline-none text-2xl text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  spellCheck="false"
                />
                {inputText && (
                  <button
                    onClick={() => setInputText('')}
                    className="absolute top-6 right-6 p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 flex items-center"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-xs font-medium px-2">{t.clear}</span>
                  </button>
                )}
              </div>

              {/* Output Area */}
              <div className="flex-1 flex flex-col p-6 bg-white/30 dark:bg-black/20 relative">
                {isTranslating && (
                  <div className="absolute top-6 right-6">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                )}
                <div className="flex-1 w-full text-2xl text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">
                  {outputText || (
                    <span className="text-gray-400 dark:text-gray-500">{t.outputPlaceholder}</span>
                  )}
                </div>
                
                {/* Output Actions */}
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!outputText}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t.copy}
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {t.poweredBy}
        </footer>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
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
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClear={() => setHistory([])}
        onRestore={handleRestoreHistory}
        t={t}
        uiLang={uiLang}
      />
    </div>
  );
}
