import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import tr from "./locales/tr.json";

// Default dil: Türkçe (Corsecure ana hedef pazarı Türkiye hukuk büroları).
// Sıralama (öncelik):
//   1. Browser localStorage `headplane.lang` (kullanıcının LanguageSwitcher seçimi)
//   2. HEADPLANE_LANG env değişkeni (deployment-level override)
//   3. "tr" (varsayılan)
//
// SSR notu: server'da `window` yok → 1. atlanır. Client hidrate olunca
// localStorage check edilir; EN seçmiş kullanıcı için 1 frame'lik flicker
// olabilir (TR ile render → EN'e geç). Cookie ile de yapılabilir ama şimdilik
// localStorage yeterli.
function detectInitialLang(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("headplane.lang");
      if (stored === "tr" || stored === "en") {
        return stored;
      }
    } catch {
      // localStorage erişim engeli (private mode, vs.) — sessizce devam
    }
  }
  if (typeof process !== "undefined" && process.env?.HEADPLANE_LANG) {
    return process.env.HEADPLANE_LANG;
  }
  return "tr";
}

const initialLang = detectInitialLang();

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: initialLang,
  fallbackLng: "tr",
  interpolation: {
    escapeValue: false, // React zaten XSS escape ediyor
  },
  // SSR uyumu için Suspense kapalı (loader senkron çalışsın)
  react: {
    useSuspense: false,
  },
});

export default i18n;
