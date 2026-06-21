import i18next, { TFunction } from "i18next";
import enUSTranslations from "./locales/en-US.yaml";
import es419Translations from "./locales/es-419.yaml";

/**
 * Initializes i18next with the specified language and returns the bound translation function.
 */
export function setupI18n(lang: string): TFunction {
  i18next.init({
    lng: lang,
    fallbackLng: "en-US",
    resources: {
      "en-US": { translation: enUSTranslations },
      "es-419": { translation: es419Translations }
    }
  });
  return i18next.t.bind(i18next);
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
