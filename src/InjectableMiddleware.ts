import {Middleware} from './Middleware';
import {PromiseAction, Action, ServiceAction} from './Action';
import {Store} from './Store';
import {Injector} from './Injector';
/**
 * Creates a middleware that can handle {PromiseAction} 
 * 
 * @export
 * @param {Injector} injector an injector instance to use for dependency resolution. 
 * @returns {Middleware} a middleware.
 */
export function Injectable(injector:Injector):Middleware{
	return function (action:ServiceAction,store:Store):Action{
		if (typeof action.service === "undefined"){
			return action;
		}
		return injector.injectFunction(action.service);
	}
}