export function IntegerPromisifer(fetching, resolved, rejected) {
    /**
     * (description)
     *
     * @export
     * @template T
     * @param {PromiseAction<T>} action (description)
     * @param {Store} store (description)
     * @returns {Action} (description)
     */
    return function IntegerPromisify(action, store) {
        if (typeof action.promise === "undefined") {
            return action;
        }
        action.promise.then(function (data) {
            store.dispatch({
                type: resolved | action.type,
                data: data
            });
        }, function (data) {
            store.dispatch({
                type: rejected | action.type,
                data: data
            });
        });
        return {
            type: fetching | action.type,
            data: action.data
        };
    };
}
