import Log from "../../../shared/log/Log";
import PhotonSchema from "./PhotonSchema";

/** Schemas that require custom handling because they can't be decoded using just the log data. */
const CustomSchemas: Map<string, (log: Log, key: string, timestamp: number, value: Uint8Array) => void> = new Map();
export default CustomSchemas;

CustomSchemas.set("rawBytes", PhotonSchema); // PhotonVision 2023.1.2
