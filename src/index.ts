import {Injector} from './Injector'; 
import {Injectable} from './InjectableMiddleware'; 
import {IntegerPromisifer} from './IntegerPromisifyMiddleware'; 
import {WorkerMiddleware} from './WorkerMiddleware';
import {Promisify} from './PromisifyMiddleware';
import {ControllerView} from './ControllerView';
import {Store} from './Store';
import {localStorageStrategy} from './LocalStoragePersistentStrategy';

export {Store,Injector,Injectable,
    IntegerPromisifer,WorkerMiddleware,
    Promisify,ControllerView,localStorageStrategy}; 


(function(StrikeJS:any){
    StrikeJS.localStorageStrategy = localStorageStrategy; 
    StrikeJS.Store = Store; 
    StrikeJS.ControllerView = ControllerView;
    StrikeJS.Promisify = Promisify; 
    StrikeJS.WorkerMiddleware = WorkerMiddleware; 
    StrikeJS.IntegerPromisifier = IntegerPromisifer; 
    StrikeJS.Injectable = Injectable; 
    StrikeJS.Injector = Injector;
}((window as any).StrikeJS = (window as any).StrikeJS || {}));