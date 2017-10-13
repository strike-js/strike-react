import {Injector,extractArgumentsFromFunction} from './Injector'; 
import {Injectable} from './InjectableMiddleware'; 
import {createPool} from './Pool'; 
import {createManagedState} from './ManagedState'; 
import {WorkerMiddleware,MultiWorkerMiddleware} from './WorkerMiddleware';
import {PromisifyMiddleware} from './PromisifyMiddleware';
import {createControllerView} from './ControllerView';
import {createStore} from './Store';
import {WebSocketMiddleware} from './WebsocketMiddleware'; 
import {localStorageStrategy} from './LocalStoragePersistentStrategy';

export {createStore,Injector,Injectable,
    createManagedState,WorkerMiddleware,
    extractArgumentsFromFunction,
    createPool,MultiWorkerMiddleware,WebSocketMiddleware,
    PromisifyMiddleware,createControllerView,
    localStorageStrategy}; 
    
declare var module; 

(function(StrikeJS:any, hasSelf){
    if (hasSelf){
        StrikeJS.localStorageStrategy = localStorageStrategy; 
    }
    StrikeJS.createStore = createStore; 
    StrikeJS.createControllerView = createControllerView;
    StrikeJS.PromisifyMiddleware = PromisifyMiddleware; 
    StrikeJS.extractArgumentsFromFunction = extractArgumentsFromFunction; 
    StrikeJS.WorkerMiddleware = WorkerMiddleware; 
    StrikeJS.createPool = createPool; 
    StrikeJS.createManagedState = createManagedState; 
    StrikeJS.Injectable = Injectable; 
    StrikeJS.Injector = Injector;
    StrikeJS.MultiWorkerMiddleware = MultiWorkerMiddleware; 
    StrikeJS.WebSocketMiddleware = WebSocketMiddleware; 
}(((typeof self) !== "undefined") ? ((self as any).StrikeJS = (self as any).StrikeJS || {}) :( module.exports.StrikeJS = {})),((typeof self) !== "undefined"));