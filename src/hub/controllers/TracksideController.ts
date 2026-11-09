// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListState } from "../../shared/SourceListConfig";
import { dbcDefinition, Limits, tileState } from "../../shared/Trackside";
import { TracksideRendererCommand } from "../../shared/renderers/TracksideRenderer";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import TabController from "./TabController";
import TracksideController_Config from "./TracksideController_Config";

export default class TracksideController implements TabController {
  UUID = createUUID();
  limits: { [logKey: string]: Limits } = {};
  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(root.firstElementChild as HTMLElement, TracksideController_Config, [], (rect) => {
      window.sendMainMessage("ask-edit-trackside-limits", {
        uuid: this.UUID,
        rect,
        fields: this.sourceList
          .getState()
          .map((source) => ({ key: source.logKey, limits: this.limits[source.logKey] ?? {} }))
      });
    });
  }
  dispose() {
    this.sourceList.stop();
  }
  saveState() {
    return { sources: this.sourceList.getState(), limits: this.limits };
  }
  restoreState(state: unknown) {
    if (typeof state !== "object" || state === null) return;
    if ("sources" in state) this.sourceList.setState(state.sources as SourceListState);
    if ("limits" in state && typeof state.limits === "object" && state.limits !== null)
      this.limits = state.limits as typeof this.limits;
  }
  refresh() {
    this.sourceList.refresh();
  }
  newAssets() {}
  /** Limits for fields still in the tile list. A removed tile's limits stop alerting. */
  getLimits() {
    const keys = new Set(this.sourceList.getState().map((source) => source.logKey));
    return Object.fromEntries(Object.entries(this.limits).filter(([key]) => keys.has(key)));
  }
  getActiveFields() {
    return this.sourceList.getActiveFields();
  }
  showTimeline() {
    return true;
  }
  getCommand(): TracksideRendererCommand {
    const time = window.selection.getRenderTime() ?? window.log.getTimestampRange()[1];
    const liveTime = window.selection.getCurrentLiveTime();
    const summary = window.liveStatus?.getLiveStatus();
    const liveEdge =
      liveTime !== null && time >= liveTime - 0.05 && summary && summary.viewedRun === summary.runCount - 1;
    return {
      message:
        liveEdge && summary.backend === "connected" && !summary.hasFreshData ? "Base connected, no car data" : "",
      tiles: this.sourceList
        .getState()
        .filter((source) => source.visible)
        .map((source) => {
          const range = window.log.getRange(source.logKey, time, time, this.UUID);
          const index = range?.timestamps.findLastIndex((t) => t <= time) ?? -1;
          const value = index < 0 ? undefined : range?.values[index];
          return tileState(
            source.logKey,
            value,
            window.log.getChannelProfile(source.logKey),
            this.limits[source.logKey],
            dbcDefinition(window.log.getMetadataString(source.logKey), source.logKey),
            liveEdge
              ? {
                  summary,
                  freshness: window.liveStatus!.getFieldFreshness(source.logKey),
                  age: window.liveStatus!.getFieldAge(source.logKey)
                }
              : undefined
          );
        })
    };
  }
}
