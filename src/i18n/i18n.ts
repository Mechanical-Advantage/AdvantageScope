// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import i18next, { TFunction } from "i18next";
import { SUPPORTED_LANGS } from "../shared/Preferences";
import arTranslation from "./locales/ar.yaml";
import enUSTranslations from "./locales/en-US.yaml";
import es419Translations from "./locales/es-419.yaml";
import frTranslations from "./locales/fr.yaml";
import heTranslations from "./locales/he.yaml";
import kkTranslations from "./locales/kk.yaml";
import ptBRTranslations from "./locales/pt-BR.yaml";
import roTranslations from "./locales/ro.yaml";
import ruTranslations from "./locales/ru.yaml";
import trTranslations from "./locales/tr.yaml";
import zhCNTranslations from "./locales/zh-CN.yaml";
import zhTWTranslations from "./locales/zh-TW.yaml";

/**
 * Initializes i18next with the specified language and returns the bound translation function.
 */
export function setupI18n(lang: string): TFunction {
  i18next.init({
    lng: lang,
    fallbackLng: "en-US",
    resources: {
      "en-US": { translation: enUSTranslations },
      "es-419": { translation: es419Translations },
      fr: { translation: frTranslations },
      "pt-BR": { translation: ptBRTranslations },
      tr: { translation: trTranslations },
      ro: { translation: roTranslations },
      he: { translation: heTranslations },
      kk: { translation: kkTranslations },
      ru: { translation: ruTranslations },
      ar: { translation: arTranslation },
      "zh-CN": { translation: zhCNTranslations },
      "zh-TW": { translation: zhTWTranslations }
    },
    interpolation: {
      escapeValue: false
    }
  });
  return i18next.t.bind(i18next);
}

/** Given a set of preferred languages, returns the best language to use. */
export function getBestLanguage(preferredLangs: readonly string[]): string {
  const supportedLower = SUPPORTED_LANGS.map((l) => l.toLowerCase());
  for (const lang of preferredLangs) {
    const langLower = lang.toLowerCase();

    // Exact match (e.g., "tr" -> "tr")
    const exactIndex = supportedLower.indexOf(langLower);
    if (exactIndex !== -1) {
      return SUPPORTED_LANGS[exactIndex];
    }

    // Primary language exact match (e.g., "fr-CA" -> "fr")
    const primaryLang = langLower.split("-")[0];
    const primaryIndex = supportedLower.indexOf(primaryLang);
    if (primaryIndex !== -1) {
      return SUPPORTED_LANGS[primaryIndex];
    }

    // Custom region fallbacks (e.g., "en-GB" -> "en-US")
    switch (primaryLang) {
      case "en":
        return "en-US";
      case "es":
        return "es-419";
      case "pt":
        return "pt-BR";
      case "zh":
        if (langLower.includes("hant") || langLower.includes("-hk") || langLower.includes("-mo")) {
          // Use Traditional Chinese for Hong Kong (zh-HK), Macau (zh-MO), and generic "Hant"
          return "zh-TW";
        } else {
          // Use Simplified Chinese for all other cases, including Singapore (zh-SG), Malaysia (zh-MY), and generic "Hans"
          return "zh-CN";
        }
    }
  }
  return "en-US";
}

/**
 * Scans the provided document for elements with the `data-i18n` attribute and translates them.
 * Supports updating inner HTML or attributes using the format `[attribute]key;key`.
 * @param document The HTML document to scan
 * @param t The translation function to use
 */
export function translateHTML(document: Document, t: TFunction) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const keyString = element.getAttribute("data-i18n");
    if (!keyString) return;

    const parts = keyString.split(";");
    parts.forEach((part) => {
      const match = part.match(/^\[(.*?)\](.*)$/);
      if (match) {
        const attribute = match[1];
        const key = match[2];
        element.setAttribute(attribute, t(key));
      } else {
        element.innerHTML = t(part);
      }
    });
  });
}
