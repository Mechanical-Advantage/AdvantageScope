// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { usePluginData } from "@docusaurus/useGlobalData";
import AlgoliaSearchBar from "@theme-original/SearchBar";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { SearchDocument } from "../../../plugins/docusaurus-minisearch-plugin";
import MiniSearchModal from "./MiniSearchModal";
import styles from "./styles.module.css";

function OfflineSearchBar(): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  // Retrieve indexed markdown documents from the build plugin
  const pluginData = usePluginData("docusaurus-minisearch-plugin") as { documents?: SearchDocument[] } | undefined;
  const documents = pluginData?.documents ?? [];

  useEffect(() => {
    setIsMac(typeof navigator !== "undefined" && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd+K (Mac) or Ctrl+K (Windows/Linux), or / when not focused on an input
    const isSearchShortcut = (e.metaKey || e.ctrlKey) && e.key === "k";
    const isSlashShortcut =
      e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement?.tagName || "").toUpperCase());

    if (isSearchShortcut || isSlashShortcut) {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.searchBox}>
      <button type="button" className={styles.searchButton} onClick={() => setIsOpen(true)} aria-label="Search">
        <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className={styles.searchPlaceholder}>Search</span>
        <span className={styles.searchKey}>{isMac ? "⌘K" : "Ctrl K"}</span>
      </button>

      <MiniSearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} documents={documents} />
    </div>
  );
}

export default function SearchBar(props: any): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  // If Algolia is configured (online build), use Algolia DocSearch
  if (siteConfig.themeConfig?.algolia) {
    return <AlgoliaSearchBar {...props} />;
  }

  // Otherwise (embed offline build), use MiniSearch
  return <OfflineSearchBar />;
}
