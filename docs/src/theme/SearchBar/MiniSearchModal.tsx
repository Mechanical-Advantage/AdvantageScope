// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { useHistory } from "@docusaurus/router";
import MiniSearch from "minisearch";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SearchDocument } from "../../../plugins/docusaurus-minisearch-plugin";
import styles from "./styles.module.css";

interface MiniSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SearchDocument[];
}

export default function MiniSearchModal({ isOpen, onClose, documents }: MiniSearchModalProps) {
  const history = useHistory();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Initialize MiniSearch instance
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch<SearchDocument>({
      fields: ["pageTitle", "sectionTitle", "content"],
      storeFields: ["id", "pageTitle", "sectionTitle", "url", "content"],
      searchOptions: {
        boost: { pageTitle: 3, sectionTitle: 2 },
        prefix: true,
        fuzzy: 0.2
      }
    });
    if (documents && documents.length > 0) {
      ms.addAll(documents);
    }
    return ms;
  }, [documents]);

  // Perform search
  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed || !miniSearch) return [];
    try {
      return miniSearch.search(trimmed).slice(0, 10);
    } catch {
      return [];
    }
  }, [query, miniSearch]);

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      (listRef.current.children[selectedIndex] as HTMLElement).scrollIntoView({
        block: "nearest"
      });
    }
  }, [selectedIndex]);

  const handleSelect = (url: string) => {
    onClose();
    history.push(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex].url);
      }
    }
  };

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={styles.modalBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modalContainer} onKeyDown={handleKeyDown}>
        <div className={styles.modalHeader}>
          <svg className={styles.modalSearchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className={styles.modalInput}
            placeholder="Search documentation..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className={styles.modalCloseButton} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {query.trim().length === 0 ? (
            <div className={styles.emptyState}>Type a query to search AdvantageScope docs</div>
          ) : results.length === 0 ? (
            <div className={styles.emptyState}>No results found for &ldquo;{query}&rdquo;</div>
          ) : (
            <ul ref={listRef} className={styles.resultsList}>
              {results.map((hit, index) => {
                const isSelected = index === selectedIndex;
                const isHeadingSameAsPage = hit.sectionTitle === hit.pageTitle;
                return (
                  <li key={hit.id}>
                    <a
                      href={hit.url}
                      className={`${styles.resultItem} ${isSelected ? styles.resultItemSelected : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelect(hit.url);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className={styles.resultHeader}>
                        <span className={styles.resultPageTitle}>{hit.pageTitle}</span>
                        {!isHeadingSameAsPage && (
                          <>
                            <span className={styles.resultSectionDivider}>&gt;</span>
                            <span>{hit.sectionTitle}</span>
                          </>
                        )}
                      </div>
                      {hit.content && <div className={styles.resultSnippet}>{hit.content}</div>}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.footerHint}>
            <span className={styles.kbd}>&uarr;</span>
            <span className={styles.kbd}>&darr;</span> to navigate
          </div>
          <div className={styles.footerHint}>
            <span className={styles.kbd}>&crarr;</span> to select
          </div>
          <div className={styles.footerHint}>
            <span className={styles.kbd}>esc</span> to close
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
