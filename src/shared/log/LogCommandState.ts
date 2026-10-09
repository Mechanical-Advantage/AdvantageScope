// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/**
 * Special case for running commands. Commands have a start time, end time, and data that doesn't change over time.
 * This is used to optimize storage and data lookup for controllers and renderers.
 */
export interface LogCommand {
  /**
   * Name of the command.
   */
  name: string;

  /**
   * Unique run ID for the command.
   */
  id: number;

  /**
   * Run ID of the parent command. Undefined if there is no parent (i.e., the command is a root).
   */
  parentId?: number;

  requirements: string[];

  /**
   * Start and end time of the command.
   */
  range: [number, number];

  /**
   * Any children of this command.
   */
  children: LogCommand[];

  /**
   * Depth of the command in the command tree. 0 for roots and positive for children.
   */
  depth: number;

  // last_time_ms and total_time_ms do change over time, and would necessitate tracking individual data points
  // but for the time being, we discard them for the sake of performance
}

/**
 * 1-to-1 mapping to the v3 mechanism protobuf.
 */
export type MechanismProto = {
  name: string;
};

/**
 * 1-to-1 mapping to the v3 command protobuf.
 */
export type CommandProto = {
  name: string;
  id: number;
  parent_id?: number;
  requirements: MechanismProto[];
  last_time_ms: number;
  total_time_ms: number;
};

/**
 * 1-to-1 mapping to the v3 scheduler protobuf.
 */
export type SchedulerProto = {
  running_commands: CommandProto[];
  queued_commands: CommandProto[];
  last_time_ms: number;
};
