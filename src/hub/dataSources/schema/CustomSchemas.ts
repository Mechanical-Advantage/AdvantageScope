import Log from "../../../shared/log/Log";
import PhotonSchema from "./PhotonSchema";
import REVSchemas from "./REVSchemas";

/** Schemas that require custom handling because they can't be decoded using just the log data. */
const CustomSchemas: Map<string, (log: Log, key: string, timestamp: number, value: Uint8Array) => void> = new Map();
export default CustomSchemas;

CustomSchemas.set("rawBytes", PhotonSchema); // PhotonVision 2023.1.2
CustomSchemas.set("sparkmax_periodic0", REVSchemas.parsePeriodic0);
CustomSchemas.set("sparkmax_periodic1", REVSchemas.parsePeriodic1);
CustomSchemas.set("sparkmax_periodic2", REVSchemas.parsePeriodic2);
CustomSchemas.set("sparkmax_periodic3", REVSchemas.parsePeriodic3);
CustomSchemas.set("sparkmax_periodic4", REVSchemas.parsePeriodic4);
CustomSchemas.set("sparkmax_periodic5", REVSchemas.parsePeriodic5);
CustomSchemas.set("sparkmax_periodic6", REVSchemas.parsePeriodic6);
