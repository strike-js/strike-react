/**
 * Responsible for combining results of the reducers within the application to create the application's state.
 *
 * @export
 * @class Combiner
 */
export class Combiner {
    /**
     * Create a new instance of {Combine} with the provided reducers.
     *
     * @static
     * @param {...Reducer[]} args the reducers to register
     * @returns (description)
     */
    static combine(...args) {
        return new Combiner(...args);
    }
    /**
     * Creates an instance of Combiner.
     *
     * @param {...Reducer[]} args (description)
     */
    constructor(...args) {
        this.reducers = {};
        let i = 0;
        for (i = 0; i < args.length; i++) {
            this.addReducer(args[i]);
        }
    }
    addReducer(r) {
        if (typeof r === "string" && arguments.length === 2) {
            this.reducers[r] = arguments[1];
        }
        else if (typeof r === "function" && r.$name) {
            this.reducers[r.$name] = r;
        }
        else if (typeof r === "function" && r.name) {
            this.reducers[r.name] = r;
        }
    }
    removeReducer(r) {
        if (typeof r === "function" &&
            r.$name && this.reducers[r.$name]) {
            delete this.reducers[r.$name];
        }
        else if (typeof r === "function" &&
            r.name && this.reducers[r.name]) {
            delete this.reducers[r.name];
        }
        else if (typeof r === "string" &&
            this.reducers[r]) {
            delete this.reducers[r];
        }
    }
    /**
     * Invoked by an application store upon receiving a new action to generate the new application state.
     *
     * @param {*} state an Immutable.Map instance.
     * @param {Action} action the action to respond to.
     * @returns the new application state which is an instance of Immutable.Map
     */
    update(state, action) {
        let newState = state, key = null, reducers = this.reducers, temp2 = null, temp = null;
        for (key in reducers) {
            temp2 = state.get(key);
            temp = reducers[key](temp2, action);
            if (temp != temp2) {
                newState = newState.set(key, temp);
            }
        }
        return newState;
    }
}
