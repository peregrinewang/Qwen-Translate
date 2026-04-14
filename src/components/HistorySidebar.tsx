import React, { memo } from 'react';
import { X, Trash2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { languages } from '../lib/languages';

export interface HistoryItem {
  id: string;
  sourceLang: string;
  targetLang: string;
  inputText: string;
  outputText: string;
  timestamp: number;
}

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClear: () => void;
  onRestore: (item: HistoryItem) => void;
  t: any;
  uiLang: 'en' | 'zh';
}

export const HistorySidebar = memo(function HistorySidebar({ isOpen, onClose, history, onClear, onRestore, t, uiLang }: HistorySidebarProps) {
  const getLangName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    if (!lang) return code;
    return uiLang === 'zh' && lang.nameZh ? lang.nameZh : lang.name;
  };

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="vellum fixed right-0 top-0 bottom-0 w-full max-w-sm border-l-0 rounded-l-3xl rounded-r-none z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                <Clock className="w-5 h-5" />
                <h2 className="text-xl font-semibold">{t.history}</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <Clock className="w-12 h-12 mb-3 opacity-20" />
                  <p>{t.noHistory}</p>
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onRestore(item)}
                    className="w-full text-left p-4 bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 border border-white/60 dark:border-white/10 rounded-2xl shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      <span>{getLangName(item.sourceLang)}</span>
                      <span>→</span>
                      <span>{getLangName(item.targetLang)}</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-1">{item.inputText}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 line-clamp-2">{item.outputText}</p>
                  </button>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="p-4 border-t border-black/5 dark:border-white/10">
                <button
                  onClick={onClear}
                  className="w-full flex items-center justify-center gap-2 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.clearHistory}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
