import Log from "../../../shared/log/Log";
import PhotonSchema from "./PhotonSchema";

const Schemas: Map<string, (log: Log, key: string, timestamp: number, value: Uint8Array) => void> = new Map();
export default Schemas;

Schemas.set("rawBytes", PhotonSchema); // PhotonVision 2023.1.2
