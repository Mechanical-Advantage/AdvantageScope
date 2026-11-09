// Copyright (c) 2026 Melbourne University Motorsports. Based on AdvantageScope (BSD-3-Clause, © Littleton Robotics).
// https://github.com/Melbourne-University-Motorsports/mur-voir
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Generated from mur-msgs aa98d26ba6df4e35af2e029b2509f07bb80bfabf. Do not edit.
// Run npm run live-api:generate.

/**
 * Decimal integer nanoseconds; never a JSON number.
 */
export type NsString = string;
export type SignalPath = string;
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
export type TimeQuality = "synchronised" | "estimated" | "unsynchronised";
export type IngressLink = "rf" | "cellular" | "lan";
export type PreferredChart = string;
export type ConeClass = string;
export type ErrorCode = string;
export type AvailabilityState = "online" | "stale" | "offline";
/**
 * Decimal strings must also fit signed int64; enforce range with integer arithmetic.
 */
export type Int64Value = number | string;
export type SampleValue = unknown;
export type ClientOp = HelloOp | SubscribeOp | UnsubscribeOp;
export type CoreServerOp =
  | CatalogueSnapshotOp
  | CatalogueUpsertOp
  | CatalogueRemoveOp
  | AvailabilityOp
  | SubscriptionAckOp
  | SamplesOp
  | ErrorOp;

/**
 * MUR live API v1 shapes. See README for semantic requirements.
 */
export interface LiveAPIExports {
  NsString?: NsString;
  SignalPath?: SignalPath;
  SignalType?: SignalType;
  TimeQuality?: TimeQuality;
  IngressLink?: IngressLink;
  PreferredChart?: PreferredChart;
  ConeClass?: ConeClass;
  ErrorCode?: ErrorCode;
  AvailabilityState?: AvailabilityState;
  DisplayHints?: DisplayHints;
  DBCProvenance?: DBCProvenance;
  SignalDescriptor?: SignalDescriptor;
  Vector3?: Vector3;
  Quaternion?: Quaternion;
  Pose3?: Pose3;
  Trajectory?: Trajectory;
  Cone?: Cone;
  ConeArray?: ConeArray;
  Int64Value?: Int64Value;
  SampleValue?: SampleValue;
  ProducerSample?: ProducerSample;
  TelemetrySample?: TelemetrySample;
  HistorySample?: HistorySample;
  CatalogueSnapshotBody?: CatalogueSnapshotBody;
  HistoryQuery?: HistoryQuery;
  HistoryResponse?: HistoryResponse;
  HttpError?: HttpError;
  HelloOp?: HelloOp;
  SubscribeOp?: SubscribeOp;
  UnsubscribeOp?: UnsubscribeOp;
  CatalogueSnapshotOp?: CatalogueSnapshotOp;
  CatalogueUpsertOp?: CatalogueUpsertOp;
  CatalogueRemoveOp?: CatalogueRemoveOp;
  AvailabilityOp?: AvailabilityOp;
  SubscriptionAckOp?: SubscriptionAckOp;
  SamplesOp?: SamplesOp;
  ErrorOp?: ErrorOp;
  ClientOp?: ClientOp;
  CoreServerOp?: CoreServerOp;
  ServerOp?: CoreServerOp;
  [k: string]: unknown;
}
export interface DisplayHints {
  label?: string;
  preferred_chart?: PreferredChart;
  [k: string]: unknown;
}
export interface DBCProvenance {
  signal: string;
  message: string;
  database?: string;
  comment?: string;
  [k: string]: unknown;
}
export interface SignalDescriptor {
  path: SignalPath;
  type: string;
  schema_version: number;
  unit: string | null;
  description: string;
  source: string;
  nominal_rate_hz: number | null;
  stale_after_ms: number;
  display: DisplayHints;
  tags: string[];
  writable: false;
  frame_id?: string;
  enum_values?: {
    /**
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` "^-?[0-9]+$".
     */
    [k: string]: string;
  };
  min?: number;
  max?: number;
  type_id?: string;
  dbc?: DBCProvenance;
  [k: string]: unknown;
}
export interface Vector3 {
  x: number;
  y: number;
  z: number;
  [k: string]: unknown;
}
export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
  [k: string]: unknown;
}
export interface Pose3 {
  position: Vector3;
  orientation: Quaternion;
  [k: string]: unknown;
}
export interface Trajectory {
  poses: Pose3[];
  [k: string]: unknown;
}
export interface Cone {
  id: string;
  position: Vector3;
  class: ConeClass;
  confidence: number;
  [k: string]: unknown;
}
export interface ConeArray {
  cones: Cone[];
  [k: string]: unknown;
}
export interface ProducerSample {
  path: SignalPath;
  stream_id: string;
  seq: number;
  t_ns: NsString;
  time_quality: TimeQuality;
  value: SampleValue;
  [k: string]: unknown;
}
export interface TelemetrySample {
  path: SignalPath;
  stream_id: string;
  seq: number;
  t_ns: NsString;
  time_quality: TimeQuality;
  value: SampleValue;
  received_ns: NsString;
  ingress_link?: IngressLink;
  [k: string]: unknown;
}
export interface HistorySample {
  stream_id: string;
  seq: number;
  t_ns: NsString;
  time_quality: TimeQuality;
  value: SampleValue;
  received_ns: NsString;
  ingress_link?: IngressLink;
  [k: string]: unknown;
}
export interface CatalogueSnapshotBody {
  api_version: 1;
  catalogue_epoch: string;
  revision: number;
  signals: SignalDescriptor[];
  [k: string]: unknown;
}
export interface HistoryQuery {
  path: SignalPath;
  from_ns?: NsString;
  to_ns?: NsString;
  max_points?: number;
  stream_id?: string;
  [k: string]: unknown;
}
export interface HistoryResponse {
  path: SignalPath;
  samples: HistorySample[];
  truncated: boolean;
  downsampled: boolean;
  stream_id?: string | null;
  [k: string]: unknown;
}
export interface HttpError {
  error: string;
  message: string;
  [k: string]: unknown;
}
export interface HelloOp {
  op: "hello";
  api_version: number;
  [k: string]: unknown;
}
export interface SubscribeOp {
  op: "subscribe";
  subscription_id: string;
  paths: SignalPath[];
  max_rate_hz?: number | null;
  include_latest?: boolean;
  [k: string]: unknown;
}
export interface UnsubscribeOp {
  op: "unsubscribe";
  subscription_id: string;
  [k: string]: unknown;
}
export interface CatalogueSnapshotOp {
  op: "catalogue_snapshot";
  api_version: 1;
  catalogue_epoch: string;
  revision: number;
  signals: SignalDescriptor[];
  [k: string]: unknown;
}
export interface CatalogueUpsertOp {
  op: "catalogue_upsert";
  catalogue_epoch: string;
  revision: number;
  signal: SignalDescriptor;
  [k: string]: unknown;
}
export interface CatalogueRemoveOp {
  op: "catalogue_remove";
  catalogue_epoch: string;
  revision: number;
  path: SignalPath;
  [k: string]: unknown;
}
export interface AvailabilityOp {
  op: "availability";
  path: SignalPath;
  state: AvailabilityState;
  last_seen_ns: NsString | null;
  [k: string]: unknown;
}
export interface SubscriptionAckOp {
  op: "subscription_ack";
  subscription_id: string;
  accepted_paths: SignalPath[];
  [k: string]: unknown;
}
export interface SamplesOp {
  op: "samples";
  subscription_id: string;
  initial: boolean;
  samples: TelemetrySample[];
  [k: string]: unknown;
}
export interface ErrorOp {
  op: "error";
  code: ErrorCode;
  message: string;
  subscription_id?: string;
  paths?: string[];
  [k: string]: unknown;
}
