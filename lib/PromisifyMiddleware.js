"use strict";
/**
 * (description)
 *
 * @export
 * @template T
 * @param {PromiseAction<T>} action (description)
 * @param {Store} store (description)
 * @returns {Action} (description)
 */
function Promisify(action, store) {
    if (typeof action.promise === "undefined") {
        return action;
    }
    action.promise.then(function (data) {
        store.dispatch({
            type: 'Resolved' + action.type,
            data: data
        });
    }, function (data) {
        store.dispatch({
            type: 'Rejected' + action.type,
            data: data
        });
    });
    return {
        type: 'Fetching' + action.type,
        data: action.data
    };
}
exports.Promisify = Promisify;
