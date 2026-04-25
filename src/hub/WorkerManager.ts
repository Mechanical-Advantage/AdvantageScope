// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** Manages communication with worker scripts using a promise interface. */
export default abstract class WorkerManager {
  private static HEARTBEAT_TIMEOUT_MS = 30_000;

  private static globalRequestId: number = 0;
  private static workers: {
    [id: number]: {
      worker: Worker;
      resolve: (value: any) => void;
      reject: (value: any) => void;
      progress?: (progress: number) => void;
      heartbeatTimer: ReturnType<typeof setTimeout> | null;
    };
  } = {};

  private static cleanupWorker(requestId: number) {
    let entry = this.workers[requestId];
    if (entry === undefined) return;
    if (entry.heartbeatTimer !== null) clearTimeout(entry.heartbeatTimer);
    entry.worker.terminate();
    delete this.workers[requestId];
  }

  private static resetHeartbeat(requestId: number) {
    let entry = this.workers[requestId];
    if (entry === undefined) return;
    if (entry.heartbeatTimer !== null) clearTimeout(entry.heartbeatTimer);
    entry.heartbeatTimer = setTimeout(() => {
      if (WorkerManager.workers[requestId] !== undefined) {
        let reject = WorkerManager.workers[requestId].reject;
        WorkerManager.cleanupWorker(requestId);
        reject(null);
      }
    }, this.HEARTBEAT_TIMEOUT_MS);
  }

  static request(script: string, payload: any, progressCallback?: (progress: number) => void): Promise<any> {
    const requestId = this.globalRequestId++;
    return new Promise<any>((resolve, reject) => {
      const worker = new Worker(script);
      this.workers[requestId] = {
        worker: worker,
        resolve: resolve,
        reject: reject,
        progress: progressCallback,
        heartbeatTimer: null
      };
      worker.onmessage = this.handleResponse;
      worker.onerror = () => {
        if (WorkerManager.workers[requestId] !== undefined) {
          let reject = WorkerManager.workers[requestId].reject;
          WorkerManager.cleanupWorker(requestId);
          reject(null);
        }
      };
      WorkerManager.resetHeartbeat(requestId);
      worker.postMessage({
        id: requestId,
        payload: payload
      });
    });
  }

  private static handleResponse(event: any) {
    let message = event.data;
    if (message.id in WorkerManager.workers) {
      if ("payload" in message) {
        let resolve = WorkerManager.workers[message.id].resolve;
        WorkerManager.cleanupWorker(message.id);
        resolve(message.payload);
      } else if ("progress" in message) {
        WorkerManager.resetHeartbeat(message.id);
        let progress = WorkerManager.workers[message.id].progress;
        if (progress !== undefined) {
          progress(message.progress as number);
        }
      } else {
        let reject = WorkerManager.workers[message.id].reject;
        WorkerManager.cleanupWorker(message.id);
        reject(null);
      }
    }
  }
}
