// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { GraphColors } from "../../shared/Colors";
import { SourceListState } from "../../shared/SourceListConfig";
import { dbcDefinition, isTracksideLive, Limits, limitUnit, tileState } from "../../shared/Trackside";
import { TracksideRendererCommand } from "../../shared/renderers/TracksideRenderer";
import { createUUID } from "../../shared/util";
import SourceList from "../SourceList";
import LineGraphController from "./LineGraphController";
import TabController from "./TabController";
import TracksideController_Config from "./TracksideController_Config";

/** Moves a visible tile to an insertion boundary while retaining hidden list entries. */
export function reorderTiles(sources: SourceListState, from: number, to: number): SourceListState {
  const visible = sources.flatMap((source, index) => (source.visible ? [index] : []));
  const result = sources.slice();
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    from >= visible.length ||
    to < 0 ||
    to > visible.length ||
    to === from ||
    to === from + 1
  )
    return result;
  const start = visible[from];
  const end = visible[to] ?? sources.length;
  const [source] = result.splice(start, 1);
  result.splice(end > start ? end - 1 : end, 0, source);
  return result;
}

/** Map opted-in tiles to the stock graph's numeric and discrete sources. */
export function tracksideGraphSources(sources: SourceListState) {
  const selected = sources.filter((source) => source.options.showInGraph === "true");
  const fields = selected.map((source, index) => ({
    ...source,
    visible: true,
    type: source.logType === "Number" ? "stepped" : "stripes",
    options: { color: GraphColors[index % GraphColors.length].key, size: "normal" }
  }));
  return {
    leftSources: fields.filter((source) => source.logType === "Number"),
    discreteSources: fields.filter((source) => source.logType !== "Number")
  };
}

export default class TracksideController implements TabController {
  UUID = createUUID();
  limits: { [logKey: string]: Limits } = {};
  private sourceList: SourceList;
  private graphController: LineGraphController;
  private graphSources = "";

  constructor(root: HTMLElement) {
    // Use the stock command pipeline, including units, gaps, axes and selection.
    const graphRoot = document.createElement("div");
    for (const axis of ["left", "right", "discrete"]) {
      const element = document.createElement("div");
      element.className = "line-graph-" + axis;
      graphRoot.append(element);
    }
    this.graphController = new LineGraphController(graphRoot);
    this.sourceList = new SourceList(root.firstElementChild as HTMLElement, TracksideController_Config, [], (rect) => {
      window.sendMainMessage("ask-edit-trackside-limits", {
        uuid: this.UUID,
        rect,
        fields: this.sourceList.getState().map((source) => ({
          key: source.logKey,
          unit: limitUnit(window.log.getChannelProfile(source.logKey)),
          limits: this.limits[source.logKey] ?? {}
        }))
      });
    });
  }
  dispose() {
    this.sourceList.stop();
    this.graphController.dispose();
  }
  reorderTiles(from: number, to: number) {
    this.sourceList.setState(reorderTiles(this.sourceList.getState(), from, to));
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
    const liveEdge = isTracksideLive(summary, liveTime, time);
    const sources = tracksideGraphSources(this.sourceList.getState());
    const serialized = JSON.stringify(sources);
    if (serialized !== this.graphSources) {
      this.graphSources = serialized;
      this.graphController.restoreState(sources);
    }
    return {
      graph: sources.leftSources.length || sources.discreteSources.length ? this.graphController.getCommand() : null,
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
