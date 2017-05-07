import {createStore} from './Store';
import {PromisifyMiddleware} from './PromisifyMiddleware';
import {Injector,extractArgumentsFromFunction} from './Injector';
import {createControllerView} from './ControllerView';
import {Injectable} from './InjectableMiddleware';
import {localStorageStrategy} from './LocalStoragePersistentStrategy';
import {createManagedState} from './ManagedState'; 
import {createPool} from './Pool'; 
import {WebSocketMiddleware} from './WebsocketMiddleware';
import {WorkerMiddleware,MultiWorkerMiddleware} from './WorkerMiddleware';  


(function(){
    if (window && document){
        (window as any).StrikeJS = {
            createStore,
            createPool,
            WorkerMiddleware,
            MultiWorkerMiddleware,
            createControllerView,
            createManagedState,
            extractArgumentsFromFunction,
            localStorageStrategy,
            Injector,
            PromisifyMiddleware,
            WebSocketMiddleware,
            Injectable
        };
    }
}());