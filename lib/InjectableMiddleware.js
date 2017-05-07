"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a middleware that can handle {PromiseAction}
 *
 * @export
 * @param {Injector} injector an injector instance to use for dependency resolution.
 * @returns {Middleware} a middleware.
 */
function Injectable(injector) {
    function onFail(err) {
        console.error(err, err.message, err.stack);
    }
    return function (action, store, next) {
        if (typeof action.service === "undefined") {
            next(action);
        }
        if (typeof action.service === "function") {
            var res = injector.injectFunction(action.service);
            if (typeof res === "object" &&
                typeof res.then === "function") {
                res.then(next, onFail);
                return;
            }
            next(res);
            return;
        }
        next(action);
    };
}
exports.Injectable = Injectable;
