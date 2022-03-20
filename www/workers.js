/** @type {Map<string, Worker>} */
const cache = new Map();

/**
 * @param {string} workerFilePath
 * @returns {Worker}
 */
export function getOrCreateWorker(workerFilePath) {
  const maybeWorker = cache.get(workerFilePath);

  if (maybeWorker) {
    return maybeWorker;
  }

  const worker = new Worker(workerFilePath, { type: "module" });
  cache.set(workerFilePath, worker);
  return worker;
}
