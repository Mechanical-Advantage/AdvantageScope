/** Manages communication with worker scripts. Duplicate workers are avoided and the response is provided through a promise. */
export default abstract class WorkerManager {
  private static workers: { [id: string]: Worker } = {};
  private static globalRequestId: number = 0;
  private static resolves: { [id: number]: (value: any) => void } = {};
  private static rejects: { [id: number]: (value: any) => void } = {};

  static request(script: string, payload: any): Promise<any> {
    if (!(script in this.workers)) {
      this.workers[script] = new Worker(script);
      this.workers[script].onmessage = this.handleResponse;
    }

    const requestId = this.globalRequestId++;
    return new Promise<any>((resolve, reject) => {
      WorkerManager.resolves[requestId] = resolve;
      WorkerManager.rejects[requestId] = reject;
      this.workers[script].postMessage({
        id: requestId,
        payload: payload
      });
    });
  }

  private static handleResponse(event: any) {
    let message = event.data;
    if ("payload" in message) {
      if (message.id in WorkerManager.resolves) {
        WorkerManager.resolves[message.id](message.payload);
      }
    } else {
      if (message.id in WorkerManager.rejects) {
        WorkerManager.rejects[message.id](null);
      }
    }
    delete WorkerManager.resolves[message.id];
    delete WorkerManager.rejects[message.id];
  }
}
