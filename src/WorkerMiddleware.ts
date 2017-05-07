import {IMiddleware,IMiddlewareNext} from './Middleware';
import {Action} from './Action';
import {IStore} from './Store';

/**
 * An action to be sent to a worker middleware
 * 
 * @export
 * @interface WorkerAction
 * @extends {Action}
 */
export interface WorkerAction extends Action {
	/**
	 * The worker identifier, if you're using the single worker middleware, 
	 * you'll just need to set this to any truthy value. 
	 */
	workerId:string;
	/**
	 * Set this to true to terminate the worker with the provided ID. 
	 * If no such worker is found, the action is ignored. 
	 */
	terminate?:boolean;
}

/**
 * A worker registry interface. 
 * The interface represents a contract for a registry to manage multiple workers. 
 * @see {MultiWorkerMiddleware}
 */
export interface WorkerRegistry{
	/**
	 * Returns a worker with a given key (identifier)
	 * @param {string} key the worker key 
	 * @returns {Worker} the requested worker
	 * @throws {Error} if no worker with the provided key exists. 
	 */
	get(key:string):Worker;
	/**
	 * Registers a worker with a key and a file.
	 * @param {string} key the key to reference the worker by. 
	 * @param {string|Worker} fileOrWorker either a file name to use with the worker 
	 * or a worker object. 
	 * @returns {WorkerRegistry} the current instance of the worker registry.
	 */
	register(key:string,fileOrWorker:string|Worker):WorkerRegistry;
	/**
	 * Terminates a worker with a given key
	 * @param {string} key the worker key. 
	 * @returns {WorkerRegistry} the current instance of the worker registry.
	 */
	terminate(key:string):WorkerRegistry; 
}

/**
 * Creates a single worker middleware. 
 * @param {Worker} worker the worker to use. 
 * @param {IStore} store the store instance. 
 * @returns {IMiddleware} 
 */
export function WorkerMiddleware(worker:Worker,store:IStore):IMiddleware{

	worker.addEventListener('open',function(e){
		let action = {
			type:'WorkerOpen',
			data:1
		}; 
		store.dispatch(action); 
	});
	worker.addEventListener('message',function(e){
		let action = e.data; 
		store.dispatch(action); 
	});

	worker.addEventListener('error',function(e){
		let action = {
			type:'WorkerError',
			data:{
				error:e.error,
				message:e.message,
				lineno:e.lineno,
				colno:e.colno
			}
		};
		store.dispatch(action);
	});


	return function(action:WorkerAction,store:IStore,next:IMiddlewareNext){
		if (!action.workerId || !worker){
			next(action); 
		}
		((action.terminate && worker.terminate()) || worker.postMessage(action));
		next();
	};
}
/**
 * Creates a multi-worker middleware. 
 * 
 * @param {WorkerRegistry} registry the worker registry to use. 
 * @param {IStore} store the state store instance 
 * @returns {Middleware} a multi-worker middleware 
 */
export function MultiWorkerMiddleware(registry:WorkerRegistry,store: IStore):IMiddleware {
	let workers:Dictionary<Worker> = {}; 

	function addWorker(workerId:string){
		let ww = workers[workerId] = registry.get(workerId);
		ww.addEventListener('open',function(e){
			let action = {
				type:'WorkerOpen',
				workerId,
				data:{
					workerId,
				}
			}; 
			store.dispatch(action); 
		});
		ww.addEventListener('message',function(e){
			let action = e.data; 
			action.workerId = workerId; 
			store.dispatch(action); 
		});
		ww.addEventListener('error',function(e){
			let action = {
				type:'WorkerError',
				workerId,
				data:{
					workerId,
					error:e.error,
					message:e.message,
					lineno:e.lineno,
					colno:e.colno
				}
			};
			store.dispatch(action);
		});
		return ww; 
	}

	return function(action: WorkerAction, store: IStore, next:IMiddlewareNext) {
		const workerId = action.workerId; 
		if (!workerId) {
			next(action);
		}
		let ww = workers[workerId]; 
		if (!ww && !action.terminate){
			ww = addWorker(workerId); 
		}
		if (action.terminate && ww){
			ww.terminate(); 
			delete ww[workerId];
			next(); 
			return; 
		}
		ww.postMessage(action);
		next();
	}
}


/**
 * Creates a basic implementation of a worker registry. 
 * @returns {WorkerRegistry} 
 */
export function createWorkerRegistry():WorkerRegistry{
	let o = null; 
	let dict:Dictionary<string> = {}; 
	let workers:Dictionary<Worker> = {}; 

	function register(key:string,file:string|Worker){
		if (typeof file === "string"){
			dict[key] = file;  
		}else if (typeof file === "object"){
			workers[key] = file; 
		}
		return o; 
	}

	function get(key:string){
		if (!workers[key]){
			if (!dict[key]){
				throw new Error(`No worker with key: ${key}`); 
			}
			workers[key] = new Worker(dict[key]);
		}
		return workers[key]; 
	}

	function terminate(key:string){
		let w = workers[key]; 
		w && w.terminate(); 
		return o; 
	}

	o = {
		register,
		get,
		terminate
	};
	
	return o; 
}