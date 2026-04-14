export interface Term {
  source: string;
  target: string;
}

export interface Tm {
  source: string;
  target: string;
}

export interface TranslationOptions {
  source_lang: string;
  target_lang: string;
  terms?: Term[];
  tm_list?: Tm[];
  domains?: string;
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string,
  model: string = 'qwen-mt-flash',
  endpoint: string = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions',
  advancedOptions?: { terms?: Term[]; tmList?: Tm[]; domainPrompt?: string }
): Promise<string> {
  if (!text.trim()) return '';
  if (!apiKey) throw new Error('API Key is missing. Please configure it in settings.');

  const translation_options: any = {
    source_lang: sourceLang === 'auto' ? 'auto' : getLanguageName(sourceLang),
    target_lang: getLanguageName(targetLang)
  };

  if (advancedOptions?.terms && advancedOptions.terms.length > 0) {
    const validTerms = advancedOptions.terms.filter(t => t.source.trim() && t.target.trim());
    if (validTerms.length > 0) translation_options.terms = validTerms;
  }
  
  if (advancedOptions?.tmList && advancedOptions.tmList.length > 0) {
    const validTmList = advancedOptions.tmList.filter(tm => tm.source.trim() && tm.target.trim());
    if (validTmList.length > 0) translation_options.tm_list = validTmList;
  }
  
  if (advancedOptions?.domainPrompt && advancedOptions.domainPrompt.trim()) {
    translation_options.domains = advancedOptions.domainPrompt.trim();
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: text }],
      translation_options
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function getLanguageName(code: string): string {
  const langMap: Record<string, string> = {
    'en': 'English', 'zh': 'Chinese', 'zh_tw': 'Traditional Chinese',
    'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean', 'es': 'Spanish',
    'fr': 'French', 'pt': 'Portuguese', 'de': 'German', 'it': 'Italian',
    'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'ms': 'Malay',
    'ar': 'Arabic', 'hi': 'Hindi', 'he': 'Hebrew', 'ur': 'Urdu',
    'bn': 'Bengali', 'pl': 'Polish', 'nl': 'Dutch', 'tr': 'Turkish',
    'km': 'Khmer', 'cs': 'Czech', 'sv': 'Swedish', 'hu': 'Hungarian',
    'da': 'Danish', 'fi': 'Finnish', 'tl': 'Tagalog', 'fa': 'Persian'
  };
  return langMap[code] || 'English';
}
