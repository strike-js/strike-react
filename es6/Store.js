import { createPool } from 'strikejs-util';
import { Combiner } from './Combiner';
import * as Immutable from 'immutable';
var ChangeStatus;
(function (ChangeStatus) {
    ChangeStatus[ChangeStatus["PENDING"] = 1] = "PENDING";
    ChangeStatus[ChangeStatus["EXECUTING"] = 2] = "EXECUTING";
    ChangeStatus[ChangeStatus["FINISHED"] = 3] = "FINISHED";
    ChangeStatus[ChangeStatus["OBSELETE"] = 4] = "OBSELETE";
})(ChangeStatus || (ChangeStatus = {}));
function createDispatcher() {
    let changePool = createPool(function () {
        return {
            key: '',
            value: null,
            status: ChangeStatus.PENDING,
        };
    });
    var changed = {};
    var list = [];
    var count = 0;
    var busy = false;
    function done() {
        busy = false;
        count--;
        if (list.length > 0) {
            exec();
        }
    }
    function exec() {
        busy = true;
        let item = null;
        while ((item = list.shift()) && item.status === ChangeStatus.OBSELETE) { }
        if (item) {
            requestAnimationFrame(() => {
                item.status = ChangeStatus.EXECUTING;
                item.value[0].setState(item.value[1], done);
            });
        }
    }
    function run(c, newState) {
        let key = c.getStateKey(), objs = changed[key], obj;
        obj = changePool.get();
        obj.status = ChangeStatus.PENDING;
        obj.value = [c, newState];
        if (!objs) {
            objs = changed[key] = [];
        }
        if (busy) {
            objs = objs.filter((e) => {
                let ok = e.status === ChangeStatus.EXECUTING;
                if (!ok) {
                    e.status = ChangeStatus.OBSELETE;
                }
                return ok;
            });
            objs.push(obj);
            list.push(obj);
            return;
        }
        list.push(obj);
        exec();
        busy = true;
    }
    let o = {
        run,
    };
    return o;
}
/**
 * A {Store} component is the main component responsible for managing the application's state.
 * Internally, the state is an instance of {Immutable.Map<string,any>}. Each {ControllerView} connects
 * to the {Store} using a specific state key. The state key of each component is used to scope the application
 * state into sections that are managed by different {ControllerView} components. In a StrikeJS application,
 * there is only one Store.
 *
 *
 * @export
 * @class Store
 */
export class Store {
    /**
     * Creates an instance of Store.
     *
     * @param {Immutable.Map<string,any>} initialState the initial state of the application. It must be an instance of {Immutable.Map}.
     * @param {Combiner} combiner the application combiner
     * @param {Array<Middleware>} [middleware] an array of middleware functions.
     * @param {boolean} [trackChanges] whether to track actions or not.
     * @param {boolean} [readiness] whether the store is ready or not.
     */
    constructor(opts) {
        let v = Immutable.Map;
        this.readyForActions = opts.ready || false;
        this.state = opts.initialState || Immutable.Map();
        this.combiner = Combiner.combine();
        this.middleware = opts.middlewares || [];
        this.prevState = {};
        this.trackChanges = opts.trackChanges || false;
        this.prevActions = [];
        this.components = [];
        this.queue = [];
        this.dispatcher = createDispatcher();
        this.replaceStateAt = this.replaceStateAt.bind(this);
        this.addMiddleware = this.addMiddleware.bind(this);
        this.applyMiddleware = this.applyMiddleware.bind(this);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.executeWithState = this.executeWithState.bind(this);
        this.getStateAt = this.getStateAt.bind(this);
        this.ready = this.ready.bind(this);
    }
    /**
     * Connects a {ControllerView} component to the application store. Mainly three things happen here:
     * 1. Add the {ControllerView} component to the list of components within the store.
     * 2. Register the {ControllerView} component's Reducer with the {Combiner}.
     * 3. Set the state at the {ControllerView} component's state key to the current state of the {ControllerView} component's state. The state is registered as an instance of {Immutable.Map<string,any>}.
     *
     * @param {ControllerView<any,any>} elem (description)
     */
    connect(elem) {
        let key = elem.getStateKey();
        this.components.push(elem);
        if (elem.getReducer) {
            this.combiner.addReducer(key, elem.getReducer());
        }
        this.replaceStateAt(key, Immutable.Map(elem.state));
    }
    /**
     * Add a given middleware to the list of registered middleware.
     * Note: middlewares are executed in order, so order does matter.
     * For example, a middleware that transforms an injectable action to a promise action,
     * must be registered before the promisify middleware, such that the results of the injectable
     * middleware can be handled by the promisify middlware.
     *
     * @param {Middleware} fn the middlware to register
     */
    addMiddleware(fn) {
        this.middleware.push(fn);
    }
    /**
     * Remove a specific middlware from the list of registered middlewares.
     * Note: the same exact function that has been registered must be passed in order for it to be removed.
     * @param {Middleware} fn the middlware function to remove.
     */
    removeMiddleware(fn) {
        let idx = this.middleware.indexOf(fn);
        if (idx !== -1) {
            this.middleware.splice(idx, 1);
        }
    }
    /**
     * Dispatches the last action that has been dispatches.
     * Note: this is only if the trackChanges flag has been set to true.
     */
    prev() {
        let action = this.prevActions.pop();
        action && this.dispatch(action);
    }
    /**
     * Get part of the application state at a given key.
     *
     * @param {string} key the state key to get the state at.
     * @returns {Immutable.Map<stirng,any>}
     */
    getStateAt(key) {
        return this.state.get(key);
    }
    /**
     * Get the overall application state.
     *
     * @returns {Immutable.Map<string,any>} (description)
     */
    getState() {
        return this.state;
    }
    /**
     * Replaces part of the application at a given key.
     *
     * @param {string} key the key to the part of state to replace.
     * @param {Immutable.Map<string,any>} val the new value for the specific part.
     */
    replaceStateAt(key, val) {
        this.state = this.state.set(key, val);
    }
    /**
     * Deletes part of the application state at a given key.
     *
     * @param {string} key the key to the part of state to delete.
     */
    deleteStateAt(key) {
        this.state = this.state.delete(key);
    }
    /**
     * Applies the registered middlewares to an action.
     *
     * @param {Action} action
     * @returns {Action} the action that resulted from applying all the middleware functions.
     */
    applyMiddleware(action) {
        let s = this;
        return this.middleware.reduce((prevVal, currentVal, idx, arr) => {
            if (!prevVal) {
                return null;
            }
            return currentVal(prevVal, s);
        }, action);
    }
    /**
     * Disconnects a {ControllerView} from the application store. Three things happen here:
     * 1. Delete the part of the state managed by the {ControllerView} component.
     * 2. Remove the component's reducer function from the {Combiner}.
     * 3. Remove the component from the list of registered {ControllerView} components.
     *
     * @param {ControllerView<any,any>} component
     */
    disconnect(component) {
        let key = component.getStateKey();
        this.combiner.removeReducer(key);
        this.state = this.state.delete(key);
        let idx = this.components.indexOf(component);
        if (idx !== -1) {
            this.components.splice(idx, 1);
        }
    }
    /**
     * Called upon dispatching an Action within the application. The following happen here:
     * 1. If the store is not in a ready state i.e. readyForActions is set to false, the action is added to the store's queue, and the function returns.
     * 2. If the store is ready, the previous state is set to the current state.
     * 3. The action is passed to the middlewares.
     * 4. If the result of applying the middlewares is null, the function returns. Otherwise,
     * 5. If the trackChanges flag is set to true, the action is pushed to the list of previous actions.
     * 6. The action is then passed to the combiner along with the current application state.
     * 7. The combiner executes all the registered reducer functions, and returns the new application state.
     * 8. The store then loops through all the ControllerView components and only updates the ones that their state have changed.
     *
     * @param {Action} action (description)
     * @returns {*} (description)
     */
    dispatch(action) {
        if (!this.readyForActions) {
            this.queue.push(action);
            return;
        }
        this.prevState = this.state;
        let a = this.applyMiddleware(action);
        if (a) {
            if (this.trackChanges) {
                this.prevActions.push(a);
            }
            let prevState = this.state, temp;
            this.state = this.combiner.update(this.state, a);
            let changed = [];
            this.components.forEach(c => {
                temp = this.state.get(c.getStateKey());
                if (Immutable.Map.isMap(temp)) {
                    if (temp && temp !== prevState.get(c.getStateKey())) {
                        this.dispatcher.run(c, temp.toObject());
                    }
                }
                else {
                    this.dispatcher.run(c, temp);
                }
            });
        }
    }
    executeWithState(fn, statekeys) {
        let st = this;
        return fn(statekeys.map((e) => {
            return st.getStateAt(e);
        }));
    }
    /**
     * Sets the store to be ready to dispatch actions, and dispatches all actions that were added to the queue.
     */
    ready() {
        this.readyForActions = true;
        let a;
        while ((a = this.queue.shift())) {
            this.dispatch(a);
        }
    }
    /**
     * Creates an instance of the Store class.
     *
     * @static
     * @param {*} initialState (description)
     * @param {Combiner} combiner (description)
     * @param {Array<Middleware>} [middleware] (description)
     * @param {boolean} [trackChanges] (description)
     * @param {boolean} [readiness] (description)
     * @returns (description)
     */
    static create(initialState, middleware, trackChanges, readiness) {
        return new Store({
            initialState: initialState,
            middlewares: middleware,
            trackChanges: trackChanges,
            ready: readiness,
        });
    }
}
