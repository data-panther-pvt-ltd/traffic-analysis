"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type LanguageCode = "en" | "ar";

type Translations = Record<string, { en: string; ar: string }>;

const translations: Translations = {
  app_title: { en: "Geo Spatial RAG", ar: "نظام تحليل جغرافي" },
  ai_assistant: { en: "AI Assistant", ar: "المساعد الذكي" },
  analyzing_data: { en: "Analyzing traffic data...", ar: "يتم تحليل بيانات المرور..." },
  generating_response: { en: "Generating response...", ar: "جاري إنشاء الرد..." },
  ready: { en: "Ready to help with traffic insights", ar: "جاهز للمساعدة في تحليلات المرور" },
  welcome_title: { en: "Welcome to Dubai Traffic AI!", ar: "مرحباً بك في مساعد المرور لدبي!" },
  welcome_desc: {
    en: "Ask me about traffic patterns, congestion, routes, or use the quick actions below.",
    ar: "اسألني عن أنماط المرور والازدحام والطرق أو استخدم الخيارات السريعة أدناه.",
  },
  quick_actions: { en: "Quick Actions:", ar: "إجراءات سريعة:" },
  qa_hotspots: { en: "Traffic hotspots", ar: "نقاط الازدحام" },
  qa_peak_hours: { en: "Peak hours", ar: "ساعات الذروة" },
  qa_route_analysis: { en: "Route analysis", ar: "تحليل الطرق" },
  input_placeholder: {
    en: "Ask about Dubai traffic patterns, routes, or congestion...",
    ar: "اسأل عن أنماط المرور في دبي أو الطرق أو الازدحام...",
  },
  btn_send: { en: "Send", ar: "إرسال" },
  btn_analyzing: { en: "Analyzing...", ar: "جاري التحليل..." },
  btn_generating: { en: "Generating...", ar: "جاري الإنشاء..." },
  powered_by: { en: "Powered by advanced AI • Real-time traffic analysis • Dubai-focused insights", ar: "مدعوم بالذكاء الاصطناعي • تحليل حركة المرور في الوقت الفعلي • رؤى مركزة على دبي" },
  ai_typing: { en: "AI is typing...", ar: "المساعد يكتب..." },
  logout: { en: "Logout", ar: "تسجيل الخروج" },
  tab_ai: { en: "AI Assistant", ar: "المساعد الذكي" },
  tab_embedding: { en: "Create Embeddings", ar: "إنشاء المتجهات" },
  tab_retrieve: { en: "Search Data", ar: "بحث البيانات" },
  semantic_data_processing: { en: "Semantic Data Processing", ar: "معالجة البيانات الدلالية" },
  transform_raw: { en: "Transform raw traffic data into searchable semantic vectors", ar: "تحويل بيانات المرور إلى متجهات دلالية قابلة للبحث" },
  semantic_search_engine: { en: "Semantic Search Engine", ar: "محرك بحث دلالي" },
  find_relevant: { en: "Find relevant traffic data using intelligent semantic search", ar: "اعثر على بيانات المرور ذات الصلة باستخدام البحث الدلالي الذكي" },
};

type I18nContextValue = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof typeof translations) => string;
  formatNumber: (value: number) => string;
  locale: string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LANG_COOKIE = "lang";
const COOKIE_MAX_AGE_DAYS = 365;

function writeLangCookie(lang: LanguageCode) {
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${maxAge}`;
}

function getInitialLang(clientDefault: LanguageCode): LanguageCode {
  if (typeof document === "undefined") return clientDefault;
  const match = document.cookie.match(new RegExp(`${LANG_COOKIE}=([^;]+)`));
  if (match && (match[1] === "en" || match[1] === "ar")) return match[1] as LanguageCode;
  return clientDefault;
}

export function I18nProvider({ children, initialLang = "en" as LanguageCode }: { children: React.ReactNode; initialLang?: LanguageCode }) {
  const [language, setLanguage] = useState<LanguageCode>(() => getInitialLang(initialLang));

  const locale = language === "ar" ? "ar" : "en";

  useEffect(() => {
    // Persist cookie and update document attributes
    writeLangCookie(language);
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [language]);

  const t = useCallback((key: keyof typeof translations) => translations[key]?.[language] ?? String(key), [language]);

  const formatNumber = useCallback((value: number) => {
    try {
      return new Intl.NumberFormat(locale, { useGrouping: true }).format(value);
    } catch {
      return String(value);
    }
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({ language, setLanguage, t, formatNumber, locale }), [language, t, formatNumber, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}


