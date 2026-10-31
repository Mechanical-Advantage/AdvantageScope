// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { LiveSourceInfo } from "../../shared/LiveSourceInfo";
import FoxgloveSource from "./foxglove/FoxgloveSource";
import { LiveDataSource } from "./LiveDataSource";
import MQTTSource from "./mqtt/MQTTSource";
import MURSource from "./mur/MURSource";
import NT4Source, { NT4Mode } from "./nt4/NT4Source";

/** A live data source that can be selected by the user. */
export interface LiveSourceDefinition extends LiveSourceInfo {
  /** Creates a new (unconnected) instance of the source. */
  create(): LiveDataSource;
}

/**
 * The single registry of live sources. The hub uses it to create sources; the
 * Electron and Lite menus receive the serializable info via "set-live-sources"
 * (see getLiveSourceInfo). To add a source, register it here.
 */
export const LIVE_SOURCES: LiveSourceDefinition[] = [
  {
    id: "foxglove",
    name: "ROS 2 (Foxglove WebSocket)",
    defaultAddress: "ws://localhost:8765",
    liteCompatible: true,
    create: () => new FoxgloveSource()
  },
  {
    id: "nt4",
    name: "NetworkTables 4",
    defaultAddress: "127.0.0.1",
    liteCompatible: true,
    create: () => new NT4Source(NT4Mode.Default)
  },
  {
    id: "mur",
    name: "MUR Telemetry",
    defaultAddress: "http://localhost:8090",
    liteCompatible: true,
    create: () => new MURSource()
  },
  {
    id: "mqtt",
    name: "MQTT direct (debug)",
    defaultAddress: "ws://localhost:1884",
    liteCompatible: true,
    create: () => new MQTTSource()
  }
];

/** The source used when the preference is unset or refers to an unknown source. */
export const DEFAULT_LIVE_SOURCE_ID = "nt4";

/** Returns the registered sources available on the current platform. */
export function getAvailableLiveSources(isLite: boolean): LiveSourceDefinition[] {
  return LIVE_SOURCES.filter((source) => !isLite || source.liteCompatible);
}

/** Returns the source with the given ID, falling back to the default source. */
export function getLiveSource(id: string, isLite: boolean): LiveSourceDefinition {
  const available = getAvailableLiveSources(isLite);
  return (
    available.find((source) => source.id === id) ??
    available.find((source) => source.id === DEFAULT_LIVE_SOURCE_ID) ??
    available[0]
  );
}

/** Returns serializable info about the available sources (for menus in the main process). */
export function getLiveSourceInfo(isLite: boolean): LiveSourceInfo[] {
  return getAvailableLiveSources(isLite).map((source) => ({
    id: source.id,
    name: source.name,
    defaultAddress: source.defaultAddress,
    liteCompatible: source.liteCompatible
  }));
}
