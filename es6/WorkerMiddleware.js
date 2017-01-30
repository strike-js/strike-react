/**
 * (description)
 *
 * @export
 * @param {Worker} worker (description)
 * @param {Store} store (description)
 * @returns {Middleware} (description)
 */
export function WorkerMiddleware(worker, store) {
    /**
     * (description)
     *
     * @param {*} e (description)
     */
    worker.onmessage = function (e) {
        let action = e.data;
        store.dispatch(action);
    };
    return function (action, store) {
        if (!action.isWorker) {
            return action;
        }
        worker.postMessage(action);
        return null;
    };
}
