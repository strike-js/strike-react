import {IMiddleware,IMiddlewareNext} from './Middleware';
import {PromiseAction, Action, ServiceAction} from './Action';
import {IStore} from './Store';
import {Injector} from './Injector';
/**
 * Creates a middleware that can handle {PromiseAction} 
 * 
 * @export
 * @param {Injector} injector an injector instance to use for dependency resolution. 
 * @returns {Middleware} a middleware.
 */
export function Injectable(injector:Injector):IMiddleware{
	function onFail(err:Error){
		console.error(err,err.message,err.stack); 
	}
	return function (action:ServiceAction,store:IStore,next:IMiddlewareNext):Action{
		if (typeof action.service === "undefined"){
			next(action);
		}
		if (typeof action.service === "function"){
			let res = injector.injectFunction(action.service);
			if (typeof res === "object" && 
				typeof res.then === "function"){
				res.then(next,onFail); 
				return; 
			}
			next(res);
			return;  
		}
		next(action); 
	}
}