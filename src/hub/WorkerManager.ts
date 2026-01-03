// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/** Manages communication with worker scripts using a promise interface. */
export default abstract class WorkerManager {
  private static globalRequestId: number = 0;
  private static workers: {
    [id: number]: {
      worker: Worker;
      resolve: (value: any) => void;
      reject: (value: any) => void;
      progress?: (progress: number) => void;
    };
  } = {};

  static request(script: string, payload: any, progressCallback?: (progress: number) => void): Promise<any> {
    const requestId = this.globalRequestId++;
    return new Promise<any>((resolve, reject) => {
      const worker = new Worker(script);
      this.workers[requestId] = {
        worker: worker,
        resolve: resolve,
        reject: reject,
        progress: progressCallback
      };
      worker.onmessage = this.handleResponse;
      worker.postMessage({
        id: requestId,
        payload: payload
      });
    });
  }

  private static handleResponse(event: any) {
    let message = event.data;
    let deleteWorker = () => {
      WorkerManager.workers[message.id].worker.terminate();
      delete WorkerManager.workers[message.id];
    };
    if (message.id in WorkerManager.workers) {
      if ("payload" in message) {
        let resolve = WorkerManager.workers[message.id].resolve;
        deleteWorker();
        resolve(message.payload);
      } else if ("progress" in message) {
        let progress = WorkerManager.workers[message.id].progress;
        if (progress !== undefined) {
          progress(message.progress as number);
        }
      } else {
        let reject = WorkerManager.workers[message.id].reject;
        deleteWorker();
        reject(null);
      }
    }
  }
}
