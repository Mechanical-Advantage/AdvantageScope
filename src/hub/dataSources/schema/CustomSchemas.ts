import Log from "../../../shared/log/Log";
import REVSchemas from "./REVSchema";

/** Schemas that require custom handling because they can't be decoded using just the log data. */
const CustomSchemas: Map<string, (log: Log, key: string, timestamp: number, value: Uint8Array) => void> = new Map();
export default CustomSchemas;

CustomSchemas.set("URCL", REVSchemas.parseURCLr1);
CustomSchemas.set("URCLr2_periodic", REVSchemas.parseURCLr2);
