import {Action} from './Action';
import {Store} from './Store';
/**
 * A function that receives the currently dispatched {Action} and the application store and returns either a new {Action} object or 
 * null to stop the execution of the dispatched action. 
 * Middlewares are useful in handling specific types of actions such as actions that need to wait for a promise to be resolved, or 
 * require access some third-party APIs, etc. 
 * @see {IntegerPromisifyMiddleware}
 * @see {PromisifyMiddleware} 
 * @see {InjectableMiddleware} 
 */
export interface Middleware {
	(arg:Action,store:Store):Action
}