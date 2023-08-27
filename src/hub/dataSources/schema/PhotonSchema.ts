import Log from "../../../shared/log/Log";

export default function process(log: Log, key: string, timestamp: number, value: Uint8Array) {
  let result = parsePacket(value, timestamp);
  saveResult(log, key, timestamp, result);
}

/** Parses raw data to create a pipeline result. */
function parsePacket(value: Uint8Array, timestamp: number): PhotonPipelineResult {
  let view = new DataView(value.buffer, value.byteOffset, value.byteLength);
  let offset = 0;

  let result = new PhotonPipelineResult();

  result.latency = view.getFloat64(offset);
  result.timestamp = timestamp - result.latency;
  offset += 8;

  const numTargets = view.getInt8(offset);
  offset += 1;

  result.targets = [];
  for (let i = 0; i < numTargets; i++) {
    let target = new PhotonTrackedTarget();
    target.yaw = view.getFloat64(offset);
    offset += 8;
    target.pitch = view.getFloat64(offset);
    offset += 8;
    target.area = view.getFloat64(offset);
    offset += 8;
    target.skew = view.getFloat64(offset);
    offset += 8;
    target.fiducialId = view.getInt32(offset);
    offset += 4;

    target.bestCameraToTarget = parseTransform3d(view, offset);
    offset += 7 * 8;
    target.altCameraToTarget = parseTransform3d(view, offset);
    offset += 7 * 8;
    target.poseAmbiguity = view.getFloat64(offset);
    offset += 8;

    target.minAreaRectCorners = [];
    for (let j = 0; j < 4; j++) {
      let x = view.getFloat64(offset);
      offset += 8;
      let y = view.getFloat64(offset);
      offset += 8;
      target.minAreaRectCorners.push({ x: x, y: y });
    }

    target.detectedCorners = [];
    const numCorners = view.getInt8(offset);
    offset += 1;
    for (let j = 0; j < numCorners; j++) {
      let x = view.getFloat64(offset);
      offset += 8;
      let y = view.getFloat64(offset);
      offset += 8;
      target.detectedCorners.push({ x: x, y: y });
    }

    result.targets.push(target);
  }

  return result;
}

/** Saves a pipeline result to a log file. */
function saveResult(log: Log, baseKey: string, timestamp: number, result: PhotonPipelineResult) {
  log.putNumber(baseKey + "/latency", timestamp, result.latency);
  log.putNumber(baseKey + "/timestamp", timestamp, result.timestamp);

  // Loop over every target in the entry
  for (const [idx, target] of result.targets.entries()) {
    // Loop over every member of the target class
    Object.entries(target).forEach(([objectFieldName, objectFieldValue]) => {
      // If it's a number, we can log directly
      if (typeof objectFieldValue === "number") {
        log.putNumber(baseKey + `/target_${idx}/${objectFieldName}`, timestamp, Number(objectFieldValue));
      }

      // If it's an array, it's either a number array or an array of TargetCorner classes
      if (Array.isArray(objectFieldValue)) {
        // First entry is a number -- log as array
        if (typeof objectFieldValue[0] === "number") {
          log.putNumberArray(baseKey + `/target_${idx}/${objectFieldName}`, timestamp, objectFieldValue);
        } else if (typeof objectFieldValue[0] === "object") {
          // we can only ever have TargetCorners, so this parsing code works (for now)
          let xArray: number[] = [];
          let yArray: number[] = [];
          objectFieldValue.forEach((it) => {
            xArray.push(it.x);
            yArray.push(it.y);
          });
          log.putNumberArray(baseKey + `/target_${idx}/${objectFieldName}_x`, timestamp, xArray);
          log.putNumberArray(baseKey + `/target_${idx}/${objectFieldName}_y`, timestamp, yArray);
        }
      }
    });
  }
}

function parseTransform3d(view: DataView, offset: number): number[] {
  let tx = view.getFloat64(offset);
  offset += 8;
  let ty = view.getFloat64(offset);
  offset += 8;
  let tz = view.getFloat64(offset);
  offset += 8;
  let qw = view.getFloat64(offset);
  offset += 8;
  let qx = view.getFloat64(offset);
  offset += 8;
  let qy = view.getFloat64(offset);
  offset += 8;
  let qz = view.getFloat64(offset);
  offset += 8;

  return [tx, ty, tz, qw, qx, qy, qz];
}

class PhotonTargetCorner {
  x: number = 0;
  y: number = 0;
}

class PhotonTrackedTarget {
  yaw: number = 0;
  pitch: number = 0;
  area: number = 0;
  skew: number = 0;
  fiducialId: number = 0;
  bestCameraToTarget: number[] = [];
  altCameraToTarget: number[] = [];
  poseAmbiguity: number = 0;
  minAreaRectCorners: PhotonTargetCorner[] = [];
  detectedCorners: PhotonTargetCorner[] = [];
}

class PhotonPipelineResult {
  latency: number = 0;
  timestamp: number = 0;
  targets: PhotonTrackedTarget[] = [];
}
