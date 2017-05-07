"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a single worker middleware.
 * @param {Worker} worker the worker to use.
 * @param {IStore} store the store instance.
 * @returns {IMiddleware}
 */
function WorkerMiddleware(worker, store) {
    worker.addEventListener('open', function (e) {
        var action = {
            type: 'WorkerOpen',
            data: 1
        };
        store.dispatch(action);
    });
    worker.addEventListener('message', function (e) {
        var action = e.data;
        store.dispatch(action);
    });
    worker.addEventListener('error', function (e) {
        var action = {
            type: 'WorkerError',
            data: {
                error: e.error,
                message: e.message,
                lineno: e.lineno,
                colno: e.colno
            }
        };
        store.dispatch(action);
    });
    return function (action, store, next) {
        if (!action.workerId || !worker) {
            next(action);
        }
        ((action.terminate && worker.terminate()) || worker.postMessage(action));
        next();
    };
}
exports.WorkerMiddleware = WorkerMiddleware;
/**
 * Creates a multi-worker middleware.
 *
 * @param {WorkerRegistry} registry the worker registry to use.
 * @param {IStore} store the state store instance
 * @returns {Middleware} a multi-worker middleware
 */
function MultiWorkerMiddleware(registry, store) {
    var workers = {};
    function addWorker(workerId) {
        var ww = workers[workerId] = registry.get(workerId);
        ww.addEventListener('open', function (e) {
            var action = {
                type: 'WorkerOpen',
                workerId: workerId,
                data: {
                    workerId: workerId,
                }
            };
            store.dispatch(action);
        });
        ww.addEventListener('message', function (e) {
            var action = e.data;
            action.workerId = workerId;
            store.dispatch(action);
        });
        ww.addEventListener('error', function (e) {
            var action = {
                type: 'WorkerError',
                workerId: workerId,
                data: {
                    workerId: workerId,
                    error: e.error,
                    message: e.message,
                    lineno: e.lineno,
                    colno: e.colno
                }
            };
            store.dispatch(action);
        });
        return ww;
    }
    return function (action, store, next) {
        var workerId = action.workerId;
        if (!workerId) {
            next(action);
        }
        var ww = workers[workerId];
        if (!ww && !action.terminate) {
            ww = addWorker(workerId);
        }
        if (action.terminate && ww) {
            ww.terminate();
            delete ww[workerId];
            next();
            return;
        }
        ww.postMessage(action);
        next();
    };
}
exports.MultiWorkerMiddleware = MultiWorkerMiddleware;
/**
 * Creates a basic implementation of a worker registry.
 * @returns {WorkerRegistry}
 */
function createWorkerRegistry() {
    var o = null;
    var dict = {};
    var workers = {};
    function register(key, file) {
        if (typeof file === "string") {
            dict[key] = file;
        }
        else if (typeof file === "object") {
            workers[key] = file;
        }
        return o;
    }
    function get(key) {
        if (!workers[key]) {
            if (!dict[key]) {
                throw new Error("No worker with key: " + key);
            }
            workers[key] = new Worker(dict[key]);
        }
        return workers[key];
    }
    function terminate(key) {
        var w = workers[key];
        w && w.terminate();
        return o;
    }
    o = {
        register: register,
        get: get,
        terminate: terminate
    };
    return o;
}
exports.createWorkerRegistry = createWorkerRegistry;
