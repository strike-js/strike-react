/**
 * Creates a middleware that can handle {PromiseAction}
 *
 * @export
 * @param {Injector} injector an injector instance to use for dependency resolution.
 * @returns {Middleware} a middleware.
 */
export function Injectable(injector) {
    return function (action, store) {
        if (typeof action.service === "undefined") {
            return action;
        }
        return injector.injectFunction(action.service);
    };
}
