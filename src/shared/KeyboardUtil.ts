// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export class KeyboardUtil {
  /**
   * Checks if operating system is macOS across different operating environments.
   */
  static isMac(): boolean {
    if (typeof window !== "undefined" && window.platform) {
      if (window.platform === "darwin") return true;
    }
    if (typeof process !== "undefined" && process.platform) {
      return process.platform === "darwin";
    }
    if (typeof navigator !== "undefined") {
      return /mac/i.test(navigator.platform || navigator.userAgent);
    }
    return false;
  }

  /**
   * Returns true if the primary modifier key for the OS is pressed.
   */
  static isPrimaryModifier(event: KeyboardEvent): boolean {
    return this.isMac() ? event.metaKey : event.ctrlKey;
  }

  /**
   * Matches a key event against a target Latin character or key string while handling non-Latin input languages.
   */
  static matchesKey(event: KeyboardEvent, target: string): boolean {
    const keyLower = event.key.toLowerCase();
    const targetLower = target.toLowerCase();

    if (keyLower === targetLower) {
      return true;
    }

    // Physical key code fallback for non-Latin layouts
    if (event.code.startsWith("Key")) {
      const codeChar = event.code.slice(3).toLowerCase();
      if (codeChar === targetLower) {
        return true;
      }
    } else if (event.code.startsWith("Digit")) {
      const codeDigit = event.code.slice(5);
      if (codeDigit === targetLower) {
        return true;
      }
    }

    return false;
  }
}
