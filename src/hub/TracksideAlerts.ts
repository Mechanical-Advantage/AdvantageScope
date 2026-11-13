// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { alertLine, dbcDefinition, isTracksideLive, Limits, tileState } from "../shared/Trackside";

export function updateTracksideAlerts(element: HTMLElement, allLimits: { [key: string]: Limits }[]) {
  const liveTime = window.selection.getCurrentLiveTime();
  const time = liveTime ?? window.selection.getRenderTime() ?? window.log.getTimestampRange()[1];
  const summary = window.liveStatus?.getLiveStatus();
  const definitions = new Map(
    window.log.getFieldKeys().flatMap((key) => {
      const definition = dbcDefinition(window.log.getMetadataString(key), key);
      return definition ? [[key, definition] as const] : [];
    })
  );
  const entries = [...definitions.keys()].map((key) => ({ key, limits: {} as Limits, fault: true }));
  allLimits.forEach((limits) =>
    Object.entries(limits).forEach(([key, limit]) => entries.push({ key, limits: limit, fault: false }))
  );
  const result = alertLine(
    entries.map(({ key, limits, fault }) => {
      const range = window.log.getRange(key, time, time);
      const index = range?.timestamps.findLastIndex((t) => t <= time) ?? -1;
      const value = index < 0 ? undefined : range?.values[index];
      const profile = window.log.getChannelProfile(key);
      const tile = tileState(
        key,
        value,
        profile,
        limits,
        fault ? definitions.get(key) : null,
        isTracksideLive(summary, liveTime)
          ? { summary, freshness: window.liveStatus!.getFieldFreshness(key), age: window.liveStatus!.getFieldAge(key) }
          : undefined
      );
      return { tile, value, profile, limits, fault };
    })
  );
  element.hidden = !result.text;
  element.textContent = result.text;
  element.title = result.text;
  element.dataset.severity = result.severity;
  document.body.classList.toggle("has-trackside-alerts", !!result.text);
}
