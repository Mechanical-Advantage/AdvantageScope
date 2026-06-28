// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import i18next, { TFunction } from "i18next";
import { SUPPORTED_LANGS } from "../shared/Preferences";
import enUSTranslations from "./locales/en-US.yaml";

/**
 * Initializes i18next with the specified language and returns the bound translation function.
 */
export function setupI18n(lang: string): TFunction {
  i18next.init({
    lng: lang,
    fallbackLng: "en-US",
    resources: {
      "en-US": { translation: enUSTranslations }
    },
    interpolation: {
      escapeValue: false
    }
  });
  return i18next.t.bind(i18next);
}

/** Given a set of preferred languages, returns the best language to use. */
export function getBestLanguage(preferredLangs: readonly string[]): string {
  for (const lang of preferredLangs) {
    if (SUPPORTED_LANGS.includes(lang)) {
      return lang;
    }
    const primaryLang = lang.split("-")[0];
    if (SUPPORTED_LANGS.includes(primaryLang)) {
      return primaryLang;
    }
    switch (primaryLang) {
      case "en":
        return "en-US";
      case "es":
        return "es-419";
      case "pt":
        return "pt-BR";
      case "zh":
        return "zh-CN";
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
