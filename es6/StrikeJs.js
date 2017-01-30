import { Store } from './Store';
import { WorkerMiddleware } from './WorkerMiddleware';
import { Promisify } from './PromisifyMiddleware';
import { Injector } from './Injector';
import { ControllerView } from './ControllerView';
import { IntegerPromisifer } from './IntegerPromisifyMiddleware';
import { Injectable } from './InjectableMiddleware';
(function () {
    if (window && document) {
        window.StrikeJS = {
            Store,
            WorkerMiddleware,
            ControllerView,
            Injector,
            Promisify,
            IntegerPromisifer,
            Injectable
        };
    }
}());
