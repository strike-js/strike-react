"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a middleware to handle action with ES6 Promises.
 * @param {number|string} fetching fetching prefix for the actoin. Defaults to 'Fetching'
 * @param {number|string} resolved resolved prefix for the action. Defaults to 'Resolved'
 * @param {number|string} rejected rejected prefix for the action. Defaults to 'Rejected'
 * @returns {IMiddlware} the promisify middleware.
 */
function PromisifyMiddleware(fetching, resolved, rejected) {
    if (fetching === void 0) { fetching = 'Fetching'; }
    if (resolved === void 0) { resolved = 'Resolved'; }
    if (rejected === void 0) { rejected = 'Rejected'; }
    function makeAction(actionType, type) {
        if (typeof actionType === "number" &&
            typeof type === "number") {
            return type | actionType;
        }
        return type + actionType;
    }
    return function IntegerPromisify(action, store, next) {
        if (!action.promise ||
            typeof action.promise !== "object" ||
            typeof action.promise.then !== "function") {
            next(action);
            return;
        }
        action.promise.then(function (data) {
            store.dispatch({
                type: makeAction(action.type, resolved),
                data: data
            });
        }, function (data) {
            store.dispatch({
                type: makeAction(action.type, rejected),
                data: data
            });
        });
        next({
            type: makeAction(action.type, fetching),
            data: action.data
        });
    };
}
exports.PromisifyMiddleware = PromisifyMiddleware;
