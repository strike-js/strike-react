"use strict";
function AppActionDispatcher(store) {
    var STEP = 0x01000000;
    var apps = {};
    var current = 0;
    return function (action, app) {
        action.app = action.app || app;
        if (typeof action.type === "string") {
            store.dispatch(action);
            return;
        }
        var aId = action.app, aType = 0;
        if (aId) {
            aType = apps[aId];
            if (!aType) {
                current += STEP;
                aType = apps[aId] = current;
            }
            action.type = aType | action.type;
        }
    };
}
exports.AppActionDispatcher = AppActionDispatcher;
