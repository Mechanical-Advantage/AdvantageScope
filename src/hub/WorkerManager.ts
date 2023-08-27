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
    let finalResponse = false;
    if (message.id in WorkerManager.workers) {
      if ("payload" in message) {
        finalResponse = true;
        WorkerManager.workers[message.id].resolve(message.payload);
      } else if ("progress" in message) {
        let progress = WorkerManager.workers[message.id].progress;
        if (progress !== undefined) {
          progress(message.progress as number);
        }
      } else {
        finalResponse = true;
        WorkerManager.workers[message.id].reject(null);
      }
    }
    if (finalResponse) {
      WorkerManager.workers[message.id].worker.terminate();
      delete WorkerManager.workers[message.id];
    }
  }
}
