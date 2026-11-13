// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import LineGraphFilter from "../../shared/LineGraphFilter";
import { SelectionMode } from "../../shared/Selection";
import { formatChannelValue } from "../../shared/display/ChannelProfile";
import { formatNumericPreview } from "../../shared/display/NumericPreview";
import { Units } from "../../shared/units";

/** Looks up and formats a field from the Line Graph's converted samples. */
export function previewNumberCommand(
  key: string,
  time: number,
  command: { timestamps: number[]; values: number[]; hasUnit: boolean },
  unitCache: Units.UnitConfig | null,
  filter = LineGraphFilter.None
): string | null {
  if (
    time < window.selection.getTimelineRange()[0] ||
    (time > window.selection.getTimelineRange()[1] && window.selection.getMode() !== SelectionMode.Locked)
  ) {
    return null;
  }
  let index = command.timestamps.findLastIndex((sample) => sample <= time);
  if (index === -1) {
    return null;
  }
  const profile = window.log.getChannelProfile(key);
  if (profile.enumLabels) return formatChannelValue(command.values[index], profile);
  return formatNumericPreview(
    command.values[index],
    unitCache !== null && command.hasUnit ? Units.getSuffixForFilter(unitCache.suffix, filter) : "",
    unitCache !== null && command.hasUnit && filter === LineGraphFilter.None && unitCache.pluralizeSuffix
  );
}
