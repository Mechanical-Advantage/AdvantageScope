// MUR live telemetry contract (spec 01 §3–§5, with the spec 02 sim extensions).
//
// Pure types plus a few tiny helpers with no runtime dependencies, so the dashboard can import
// this file directly. Everything here is erasable TypeScript (no enums/namespaces).

export const API_VERSION = 1;

// ---------------------------------------------------------------------------------------------
// §3 Signal descriptors

export type SignalType =
  | "float64"
  | "int64"
  | "bool"
  | "string"
  | "enum"
  | "vector3"
  | "quaternion"
  | "pose3"
  | "trajectory"
  | "cone_array";

/** Types that min/max downsampling applies to. */
export const NUMERIC_TYPES: readonly SignalType[] = ["float64", "int64"];

export type PreferredChart = "line" | "state" | "text" | "3d" | (string & {});

export interface DisplayHints {
  label?: string;
  preferred_chart?: PreferredChart;
  [key: string]: unknown;
}

/** Time domain of `t_ns` (extension, spec 02 §2/§4). Absent means `unix`. */
export type ClockDomain = "unix" | "sim";

export interface SignalDescriptor {
  path: string;
  /** Logical type; unknown strings must be tolerated by clients. */
  type: SignalType | (string & {});
  schema_version: number;
  unit: string | null;
  description: string;
  source: string;
  nominal_rate_hz: number | null;
  stale_after_ms: number;
  display: DisplayHints;
  tags: string[];
  writable: false;
  // optional
  frame_id?: string;
  /** Integer-as-string -> label. */
  enum_values?: Record<string, string>;
  min?: number;
  max?: number;
  encoding?: string;
  type_id?: string;
  // extensions (spec 02)
  clock_domain?: ClockDomain;
  /** ROS 2 message type the value was mapped from, e.g. `geometry_msgs/msg/PoseStamped`. */
  ros_msg_type?: string;
}

// ---------------------------------------------------------------------------------------------
// §4 Values and samples

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}
export interface Pose3 {
  position: Vector3;
  orientation: Quaternion;
}
export interface Trajectory {
  poses: Pose3[];
}
export type ConeClass = "blue" | "yellow" | "orange" | "orange_big" | "unknown" | (string & {});
export interface Cone {
  id: string;
  position: Vector3;
  class: ConeClass;
  confidence: number;
}
export interface ConeArray {
  cones: Cone[];
}

/**
 * JSON value. `int64` is a JSON number when within ±(2^53-1), otherwise a decimal string
 * (parse with `parseInt64`). `enum` is an integer; look it up in `enum_values`.
 */
export type SampleValue = number | string | boolean | Vector3 | Quaternion | Pose3 | Trajectory | ConeArray | unknown;

export type TimeQuality = "synchronised" | "estimated" | "unsynchronised";
export type IngressLink = "rf" | "cellular" | "lan";

/** Decimal-string nanoseconds. Never a JS number. */
export type NsString = string;

export interface TelemetrySample {
  path: string;
  stream_id: string;
  /** Monotonic per (path, stream_id); starts at 0. Gaps mean dropped samples. */
  seq: number;
  t_ns: NsString;
  received_ns: NsString;
  time_quality: TimeQuality;
  ingress_link?: IngressLink;
  value: SampleValue;
}

/** History samples omit `path` (it is on the response). */
export type HistorySample = Omit<TelemetrySample, "path">;

/** Dedup key from spec §4.1. */
export function sampleKey(s: { path: string; stream_id: string; seq: number }): string {
  return `${s.path}\u0000${s.stream_id}\u0000${s.seq}`;
}

/** Parses an int64 JSON value (number or decimal string) into a bigint. */
export function parseInt64(v: number | string): bigint {
  return typeof v === "number" ? BigInt(v) : BigInt(v);
}

// ---------------------------------------------------------------------------------------------
// §5.1 HTTP catalogue

export interface CatalogueSnapshotBody {
  api_version: 1;
  catalogue_epoch: string;
  revision: number;
  signals: SignalDescriptor[];
  /** Extension: clock domain for every `t_ns` from this server. */
  clock_domain?: ClockDomain;
}

// §5.3 HTTP history

export interface HistoryQuery {
  path: string;
  from_ns?: NsString;
  to_ns?: NsString;
  max_points?: number;
  /** Extension: select a stream (default: the most recent stream for the path). */
  stream_id?: string;
}

export interface HistoryResponse {
  path: string;
  samples: HistorySample[];
  /** True if only the newest part of the range was returned (string signals). */
  truncated: boolean;
  /** True if samples were selected across the range (min/max buckets, state changes, stride). */
  downsampled: boolean;
  /** Extension: stream the samples belong to, null if none. */
  stream_id?: string | null;
}

export interface HttpError {
  error: string;
  message: string;
}

// ---------------------------------------------------------------------------------------------
// §5.2 WebSocket: client -> server

export interface HelloOp {
  op: "hello";
  api_version: number;
}
export interface SubscribeOp {
  op: "subscribe";
  subscription_id: string;
  paths: string[];
  max_rate_hz?: number | null;
  include_latest?: boolean;
}
export interface UnsubscribeOp {
  op: "unsubscribe";
  subscription_id: string;
}
export type ClientOp = HelloOp | SubscribeOp | UnsubscribeOp;

// §5.2 WebSocket: server -> client

export interface CatalogueSnapshotOp extends Omit<CatalogueSnapshotBody, "api_version"> {
  op: "catalogue_snapshot";
  api_version: 1;
}
export interface CatalogueUpsertOp {
  op: "catalogue_upsert";
  catalogue_epoch: string;
  revision: number;
  signal: SignalDescriptor;
}
export interface CatalogueRemoveOp {
  op: "catalogue_remove";
  catalogue_epoch: string;
  revision: number;
  path: string;
}
export type AvailabilityState = "online" | "stale" | "offline";
export interface AvailabilityOp {
  op: "availability";
  path: string;
  state: AvailabilityState;
  /** t_ns of the newest sample, or null if never seen. */
  last_seen_ns: NsString | null;
}
export interface SubscriptionAckOp {
  op: "subscription_ack";
  subscription_id: string;
  accepted_paths: string[];
}
export interface SamplesOp {
  op: "samples";
  subscription_id: string;
  initial: boolean;
  samples: TelemetrySample[];
}
export type ErrorCode =
  | "unknown_signal"
  | "bad_request"
  | "unknown_op"
  | "hello_required"
  | "unsupported_api_version"
  | "unknown_subscription"
  | (string & {});
export interface ErrorOp {
  op: "error";
  code: ErrorCode;
  message: string;
  subscription_id?: string;
  /** Extension: the offending paths for `unknown_signal`. */
  paths?: string[];
}

// Extension (spec 02 §4/§6): simulation clock state.
export type SimState = "running" | "paused";
export interface SimStatus {
  clock_domain: ClockDomain;
  state: SimState;
  sim_time_ns: NsString;
  reset_count: number;
  /** Current stream ids by source. Changes on reset. */
  stream_ids: Record<string, string>;
  speed: number;
}
export interface SimStatusOp extends SimStatus {
  op: "sim_status";
  /** What caused this event. */
  reason: "hello" | "pause" | "resume" | "reset";
}

export type ServerOp =
  | CatalogueSnapshotOp
  | CatalogueUpsertOp
  | CatalogueRemoveOp
  | AvailabilityOp
  | SubscriptionAckOp
  | SamplesOp
  | ErrorOp
  | SimStatusOp;
