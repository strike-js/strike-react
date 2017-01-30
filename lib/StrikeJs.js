"use strict";
var Store_1 = require("./Store");
var WorkerMiddleware_1 = require("./WorkerMiddleware");
var PromisifyMiddleware_1 = require("./PromisifyMiddleware");
var Injector_1 = require("./Injector");
var ControllerView_1 = require("./ControllerView");
var IntegerPromisifyMiddleware_1 = require("./IntegerPromisifyMiddleware");
var InjectableMiddleware_1 = require("./InjectableMiddleware");
(function () {
    if (window && document) {
        window.StrikeJS = {
            Store: Store_1.Store,
            WorkerMiddleware: WorkerMiddleware_1.WorkerMiddleware,
            ControllerView: ControllerView_1.ControllerView,
            Injector: Injector_1.Injector,
            Promisify: PromisifyMiddleware_1.Promisify,
            IntegerPromisifer: IntegerPromisifyMiddleware_1.IntegerPromisifer,
            Injectable: InjectableMiddleware_1.Injectable
        };
    }
}());
