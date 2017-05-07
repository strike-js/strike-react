"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Store_1 = require("./Store");
var PromisifyMiddleware_1 = require("./PromisifyMiddleware");
var Injector_1 = require("./Injector");
var ControllerView_1 = require("./ControllerView");
var InjectableMiddleware_1 = require("./InjectableMiddleware");
var LocalStoragePersistentStrategy_1 = require("./LocalStoragePersistentStrategy");
var ManagedState_1 = require("./ManagedState");
var Pool_1 = require("./Pool");
var WebsocketMiddleware_1 = require("./WebsocketMiddleware");
var WorkerMiddleware_1 = require("./WorkerMiddleware");
(function () {
    if (window && document) {
        window.StrikeJS = {
            createStore: Store_1.createStore,
            createPool: Pool_1.createPool,
            WorkerMiddleware: WorkerMiddleware_1.WorkerMiddleware,
            MultiWorkerMiddleware: WorkerMiddleware_1.MultiWorkerMiddleware,
            createControllerView: ControllerView_1.createControllerView,
            createManagedState: ManagedState_1.createManagedState,
            extractArgumentsFromFunction: Injector_1.extractArgumentsFromFunction,
            localStorageStrategy: LocalStoragePersistentStrategy_1.localStorageStrategy,
            Injector: Injector_1.Injector,
            PromisifyMiddleware: PromisifyMiddleware_1.PromisifyMiddleware,
            WebSocketMiddleware: WebsocketMiddleware_1.WebSocketMiddleware,
            Injectable: InjectableMiddleware_1.Injectable
        };
    }
}());
