// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SUPPORTED_LANGS } from "../Preferences";
import TabRenderer from "./TabRenderer";

export default class DocumentationRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private IFRAME: HTMLIFrameElement;

  private stateQueue: string | null = null;
  private loaded = false;
  private scrollPosition = 0;
  private shouldResetScroll = false;
  private firstRender = true;

  constructor(content: HTMLElement) {
    this.CONTAINER = content.getElementsByClassName("documentation-container")[0] as HTMLElement;
    this.IFRAME = this.CONTAINER.firstElementChild as HTMLIFrameElement;

    // Periodic function to record when tab is hidden
    let periodic = () => {
      if (this.CONTAINER.getBoundingClientRect().height === 0) {
        this.shouldResetScroll = true;
      }
      window.requestAnimationFrame(periodic);
    };
    window.requestAnimationFrame(periodic);
  }

  private cleanHash(hash: string): string {
    let path = hash;
    if (path.startsWith("#")) {
      path = path.slice(1);
    }
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    for (const locale of SUPPORTED_LANGS) {
      if (locale === "en-US") continue;
      if (path.startsWith("/" + locale + "/")) {
        return path.slice(locale.length + 1);
      } else if (path === "/" + locale) {
        return "/";
      }
    }
    return path;
  }

  private getHashForLang(cleanPath: string, lang: string): string {
    if (lang === "en-US") {
      return "#" + cleanPath;
    } else {
      if (cleanPath === "/") {
        return "#/" + lang;
      } else {
        return "#/" + lang + cleanPath;
      }
    }
  }

  saveState(): unknown {
    const hash = this.IFRAME.contentWindow?.location.hash;
    if (typeof hash === "string") {
      return this.cleanHash(hash);
    }
    return null;
  }

  restoreState(state: unknown): void {
    if (typeof state === "string") {
      const correctHash = this.getHashForLang(state, window.lang);
      if (this.loaded) {
        this.IFRAME.contentWindow!.location.hash = correctHash;
      } else {
        this.stateQueue = correctHash;
      }
    }
  }

  getAspectRatio(): number | null {
    return null;
  }

  render(_: unknown): void {
    // Load documentation page once visible
    if (this.firstRender) {
      this.firstRender = false;
      if (window.lang === "en-US") {
        this.IFRAME.src = "../docs/build/index.html";
      } else {
        this.IFRAME.src = `../docs/build/${window.lang}/index.html#/${window.lang}`;
      }
      this.IFRAME.addEventListener("load", () => {
        this.loaded = true;

        // Set up MutationObserver on the iframe's document to fix image paths
        const iframeDocument = this.IFRAME.contentDocument;
        if (iframeDocument) {
          const fixImages = () => {
            const imgs = iframeDocument.querySelectorAll("img");
            imgs.forEach((img) => {
              const src = img.getAttribute("src");
              if (src && src.startsWith("/img/")) {
                // Convert relative /img/... to the correct path relative to parent window
                const newSrc = new URL("../docs/build" + src, window.location.href).href;
                img.setAttribute("src", newSrc);
              }
            });
          };

          // Fix any images already in the initial DOM
          fixImages();

          // Observe future mutations
          const observer = new MutationObserver((mutations) => {
            let needsFix = false;
            for (const mutation of mutations) {
              if (mutation.type === "childList") {
                for (const node of mutation.addedNodes) {
                  if (node instanceof HTMLElement) {
                    if (node.tagName === "IMG" || node.querySelector("img")) {
                      needsFix = true;
                      break;
                    }
                  }
                }
              } else if (mutation.type === "attributes" && mutation.attributeName === "src") {
                const target = mutation.target as HTMLElement;
                if (target.tagName === "IMG") {
                  const src = target.getAttribute("src");
                  if (src && src.startsWith("/img/")) {
                    needsFix = true;
                  }
                }
              }
              if (needsFix) break;
            }
            if (needsFix) {
              fixImages();
            }
          });

          observer.observe(iframeDocument.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["src"]
          });

          // Detect and fix incorrect hashes (e.g. homepage links)
          const checkAndFixHash = () => {
            const currentHash = iframeDocument.defaultView?.location.hash;
            if (typeof currentHash === "string") {
              const cleaned = this.cleanHash(currentHash);
              const expectedHash = this.getHashForLang(cleaned, window.lang);
              if (currentHash !== expectedHash && iframeDocument.defaultView) {
                iframeDocument.defaultView.location.hash = expectedHash;
              }
            }
          };

          checkAndFixHash();
          iframeDocument.defaultView?.addEventListener("hashchange", checkAndFixHash);
        }
      });
    }

    // Navigate to initial page when loaded
    if (this.stateQueue !== null && this.loaded) {
      this.IFRAME.contentWindow!.location.hash = this.stateQueue;
      this.stateQueue = null;
    }

    // Update scroll location
    if (this.loaded && this.IFRAME.contentWindow !== null) {
      if (this.shouldResetScroll) {
        this.IFRAME.contentWindow.scrollTo(0, this.scrollPosition);
        this.shouldResetScroll = false;
      } else {
        this.scrollPosition = this.IFRAME.contentWindow.scrollY;
      }
    }
  }
}
