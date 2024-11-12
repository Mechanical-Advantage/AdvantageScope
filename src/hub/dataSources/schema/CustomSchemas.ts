import Log from "../../../shared/log/Log";
import URCLSchema from "./URCLSchema";
import URCLSchemaLegacy from "./URCLSchemaLegacy";

/** Schemas that require custom handling because they can't be decoded using just the log data. */
const CustomSchemas: Map<string, (log: Log, key: string, timestamp: number, value: Uint8Array) => void> = new Map();
export default CustomSchemas;

CustomSchemas.set("URCL", URCLSchemaLegacy.parseURCLr1);
CustomSchemas.set("URCLr2_periodic", URCLSchemaLegacy.parseURCLr2);
CustomSchemas.set("URCLr3_periodic", URCLSchema.parseURCLr3);
