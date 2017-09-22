"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pool_1 = require("./Pool");
var ManagedState_1 = require("./ManagedState");
/**
 * Creates a state container instance with the provided configurations
 * @param {StoreCfg} cfg the store configurations.
 * @returns {IStore}
 */
function createStore(cfg) {
    var components = {};
    var actions = {};
    var backlog = [];
    var middlewares = cfg.middlewares || [];
    var isReady = typeof cfg.ready === "undefined" ? true : cfg.ready;
    var trackChanges = typeof cfg.trackChanges === "undefined" ? false : cfg.trackChanges;
    var o = null;
    var queue = [];
    var pool = Pool_1.createPool(ManagedState_1.createManagedState);
    var pendingChanges = {};
    var waitingQueue = {};
    function connect(el) {
        var key = el.getStateKey();
        components[key] = el;
        waitingQueue[key] = undefined;
        pendingChanges[key] = false;
        return o;
    }
    function disconnect(el) {
        delete components[el.getStateKey()];
        delete waitingQueue[el.getStateKey()];
        delete pendingChanges[el.getStateKey()];
        return o;
    }
    function getStateAt(key) {
        return components[key] && components[key].state;
    }
    function setStateAt(key, val) {
        if (components[key]) {
            components[key].setState(val);
            return o;
        }
        throw new Error("Component with key " + key + " could not be found");
    }
    function applyMiddleware(action, done) {
        var idx = 0;
        var m = null;
        function next(action) {
            if (!action || idx >= middlewares.length) {
                return done(action);
            }
            m = middlewares[idx];
            idx++;
            return m(action, o, next);
        }
        next(action);
    }
    function hasPendingChanges(key) {
        return pendingChanges[key];
    }
    function doneExecute(key) {
        if (waitingQueue[key] && waitingQueue[key].length) {
            waitingQueue[key].shift()();
            return;
        }
        // pendingChanges[key] = false; 
    }
    function doExecute(key, action) {
        var managedState = pool.get();
        var component = components[key];
        managedState.setState(component.state);
        var rd = component.getReducer();
        if (rd) {
            rd(managedState, action);
            if (managedState.hasChanges()) {
                var changes = managedState.changes();
                pendingChanges[key] = true;
                component.setState(function () { return changes; }, function () {
                    pendingChanges[key] = false;
                    doneExecute(key);
                    action.onDone && action.onDone();
                });
            }
        }
        pool.put(managedState);
    }
    function whenReady(key, action) {
        waitingQueue[key] = waitingQueue[key] || [];
        waitingQueue[key].push(function () {
            doExecute(key, action);
        });
    }
    function execute(action) {
        if (action) {
            if (trackChanges) {
                backlog.push(action);
            }
            for (var key in components) {
                if (hasPendingChanges(key)) {
                    whenReady(key, action);
                    continue;
                }
                doExecute(key, action);
            }
        }
    }
    function ready() {
        isReady = true;
        var action = null;
        while ((action = queue.shift())) {
            dispatch.apply(null, action);
        }
    }
    function onAction(action) {
        var act = applyMiddleware(action, function (finalAction) {
            finalAction && execute(finalAction);
        });
    }
    function onActionFail(err) {
        console.log(err, err.message, err.stack);
    }
    function dispatch() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!isReady) {
            queue.push(Array.prototype.slice.call(args, 0));
            return;
        }
        if (args.length === 0) {
            throw new Error("No action provided");
        }
        else if (args.length === 1) {
            if (typeof args[0] === "function") {
                args[0](dispatch, getStateAt);
            }
            else if (typeof args[0] === "object") {
                onAction(args[0]);
            }
        }
        else if (args.length === 2) {
            if ((typeof args[0] === "string" ||
                typeof args[0] === "number") &&
                typeof args[1] !== "object") {
                onAction({
                    type: args[0],
                    data: args[1]
                });
            }
            else if (typeof args[0] === "string" &&
                typeof args[1] === "function") {
                var st = getStateAt(args[0]);
                args[1](dispatch, getStateAt, st);
            }
            else if (typeof args[0] === "function") {
                args[0](dispatch, getStateAt, args[1]);
            }
        }
    }
    o = {
        connect: connect,
        disconnect: disconnect,
        getStateAt: getStateAt,
        setStateAt: setStateAt,
        dispatch: dispatch,
        ready: ready,
    };
    return o;
}
exports.createStore = createStore;
