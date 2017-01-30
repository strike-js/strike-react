import {Injector} from './Injector'; 
import {Injectable} from './InjectableMiddleware'; 
import {IntegerPromisifer} from './IntegerPromisifyMiddleware'; 
import {WorkerMiddleware} from './WorkerMiddleware';
import {Promisify} from './PromisifyMiddleware';
import {ControllerView} from './ControllerView';
import {Store} from './Store';

export {Store,Injector,Injectable,
    IntegerPromisifer,WorkerMiddleware,
    Promisify,ControllerView}; 


(function(StrikeJS:any){
    StrikeJS.Store = Store; 
    StrikeJS.ControllerView = ControllerView;
    StrikeJS.Promisify = Promisify; 
    StrikeJS.WorkerMiddleware = WorkerMiddleware; 
    StrikeJS.IntegerPromisifier = IntegerPromisifer; 
    StrikeJS.Injectable = Injectable; 
    StrikeJS.Injector = Injector;
}((window as any).StrikeJS = (window as any).StrikeJS || {}));