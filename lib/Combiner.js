"use strict";
/**
 * Responsible for combining results of the reducers within the application to create the application's state.
 *
 * @export
 * @class Combiner
 */
var Combiner = (function () {
    /**
     * Creates an instance of Combiner.
     *
     * @param {...Reducer[]} args (description)
     */
    function Combiner() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.reducers = {};
        var i = 0;
        for (i = 0; i < args.length; i++) {
            this.addReducer(args[i]);
        }
    }
    /**
     * Create a new instance of {Combine} with the provided reducers.
     *
     * @static
     * @param {...Reducer[]} args the reducers to register
     * @returns (description)
     */
    Combiner.combine = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new (Combiner.bind.apply(Combiner, [void 0].concat(args)))();
    };
    Combiner.prototype.addReducer = function (r) {
        if (typeof r === "string" && arguments.length === 2) {
            this.reducers[r] = arguments[1];
        }
        else if (typeof r === "function" && r.$name) {
            this.reducers[r.$name] = r;
        }
        else if (typeof r === "function" && r.name) {
            this.reducers[r.name] = r;
        }
    };
    Combiner.prototype.removeReducer = function (r) {
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
    };
    /**
     * Invoked by an application store upon receiving a new action to generate the new application state.
     *
     * @param {*} state an Immutable.Map instance.
     * @param {Action} action the action to respond to.
     * @returns the new application state which is an instance of Immutable.Map
     */
    Combiner.prototype.update = function (state, action) {
        var newState = state, key = null, reducers = this.reducers, temp2 = null, temp = null;
        for (key in reducers) {
            temp2 = state.get(key);
            temp = reducers[key](temp2, action);
            if (temp != temp2) {
                newState = newState.set(key, temp);
            }
        }
        return newState;
    };
    return Combiner;
}());
exports.Combiner = Combiner;
