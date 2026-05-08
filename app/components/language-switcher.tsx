import { useTranslation } from "react-i18next";

import cn from "~/utils/cn";

const STORAGE_KEY = "headplane.lang";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith("en") ? "en" : "tr";

  const change = (lng: "tr" | "en") => {
    i18n.changeLanguage(lng);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, lng);
      } catch {
        // localStorage unavailable (private mode, etc.) — sessizce yoksay
      }
    }
  };

  const buttonClass = (active: boolean) =>
    cn(
      "px-2 py-0.5 text-xs font-semibold rounded transition-colors",
      active
        ? "bg-mist-300 dark:bg-mist-700 text-mist-900 dark:text-mist-50"
        : "text-mist-500 dark:text-mist-400 hover:text-mist-700 dark:hover:text-mist-200",
    );

  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label={t("language.switcherLabel")}
    >
      <button
        type="button"
        onClick={() => change("tr")}
        aria-pressed={current === "tr"}
        className={buttonClass(current === "tr")}
      >
        {t("language.tr")}
      </button>
      <span className="text-xs text-mist-400 dark:text-mist-600">|</span>
      <button
        type="button"
        onClick={() => change("en")}
        aria-pressed={current === "en"}
        className={buttonClass(current === "en")}
      >
        {t("language.en")}
      </button>
    </div>
  );
}
