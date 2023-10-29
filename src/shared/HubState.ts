import TabType from "./TabType";
import LoggableType from "./log/LoggableType";
import { UnitConversionPreset } from "./units";

export interface HubState {
  sidebar: SidebarState;
  tabs: TabGroupState;
}

export interface SidebarState {
  width: number;
  expanded: string[];
}

export interface TabGroupState {
  selected: number;
  tabs: TabState[];
}

export interface TabState {
  type: TabType;
  title?: string;
}

export interface LineGraphState {
  type: TabType.LineGraph;
  legends: {
    left: {
      lockedRange: [number, number] | null;
      unitConversion: UnitConversionPreset;
      fields: {
        key: string;
        color: string;
        show: boolean;
      }[];
    };
    discrete: {
      fields: {
        key: string;
        color: string;
        show: boolean;
      }[];
    };
    right: {
      lockedRange: [number, number] | null;
      unitConversion: UnitConversionPreset;
      fields: {
        key: string;
        color: string;
        show: boolean;
      }[];
    };
  };
}

export interface TableState {
  type: TabType.Table;
  fields: string[];
}

export interface ConsoleState {
  type: TabType.Console;
  field: string | null;
}

export interface StatisticsState {
  type: TabType.Statistics;
  fields: (string | null)[];
  selectionType: string;
  selectionRangeMin: number;
  selectionRangeMax: number;
  measurementType: string;
  measurementSampling: string;
  measurementSamplingPeriod: number;
  histogramMin: number;
  histogramMax: number;
  histogramStep: number;
}

export interface TimelineVisualizerState {
  type: TabType.Odometry | TabType.ThreeDimension | TabType.Video | TabType.Points | TabType.Joysticks;
  fields: ({ key: string; sourceTypeIndex: number; sourceType: LoggableType | string } | null)[];
  listFields: { type: string; key: string; sourceTypeIndex: number; sourceType: LoggableType | string }[][];
  options: { [id: string]: any };
  configHidden: boolean;
}
