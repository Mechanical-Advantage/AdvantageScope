// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

(function () {
  var supportedLangs = ["en-US", "es-419", "fr", "pt-BR", "tr", "ro", "he", "kk", "ru", "ar", "zh-CN", "zh-TW"];
  var defaultLocale = "en-US";

  // Listen for manual language changes (locale dropdown clicks)
  document.addEventListener("click", function (e) {
    var anchor = e.target.closest && e.target.closest("a");
    if (anchor) {
      var lang = anchor.getAttribute("lang");
      if (lang && supportedLangs.indexOf(lang) !== -1) {
        localStorage.setItem("AdvantageScopeDocs/lang", lang);
      }
    }
  });

  // Perform redirect if needed
  try {
    // If it's a search bot, do not redirect
    if (/bot|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex|spider|crawl|lighthouse/i.test(navigator.userAgent)) {
      return;
    }

    // Get stored manual preference or detect browser language
    var targetLocale = localStorage.getItem("AdvantageScopeDocs/lang");
    if (!targetLocale) {
      var preferredLangs = navigator.languages || (navigator.language ? [navigator.language] : []);
      for (var i = 0; i < preferredLangs.length; i++) {
        var lang = preferredLangs[i];
        if (supportedLangs.indexOf(lang) !== -1) {
          targetLocale = lang;
          break;
        }
        var primaryLang = lang.split("-")[0];
        if (supportedLangs.indexOf(primaryLang) !== -1) {
          targetLocale = primaryLang;
          break;
        }
        switch (primaryLang) {
          case "en":
            targetLocale = "en-US";
            break;
          case "es":
            targetLocale = "es-419";
            break;
          case "pt":
            targetLocale = "pt-BR";
            break;
          case "zh":
            targetLocale = "zh-CN";
            break;
        }
        if (targetLocale) break;
      }
      if (!targetLocale) {
        targetLocale = defaultLocale;
      }
    }

    // Determine current locale of the page
    var pathname = window.location.pathname;
    var segments = pathname.split("/").filter(Boolean);
    var currentLocale = defaultLocale;
    var relativePath = pathname;

    if (segments.length > 0) {
      var firstSegment = segments[0];
      if (supportedLangs.indexOf(firstSegment) !== -1 && firstSegment !== defaultLocale) {
        currentLocale = firstSegment;
        relativePath = "/" + segments.slice(1).join("/");
      }
    }

    // If target locale is different from current, redirect
    if (currentLocale !== targetLocale) {
      var targetPath = targetLocale === defaultLocale ? relativePath : "/" + targetLocale + relativePath;
      targetPath = targetPath.replace(/\/+/g, "/");
      var newUrl = targetPath + window.location.search + window.location.hash;
      window.location.replace(newUrl);
    }
  } catch (e) {
    console.error("Language redirect error:", e);
  }
})();
