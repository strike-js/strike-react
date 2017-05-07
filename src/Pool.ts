/**
 * An object pool 
 */
export interface Pool<V> {
    /**
     * Returns an object from the pool. 
     * @param {any} v an optional to be passed to the generator function if provided. Otherwise, it is ignored. 
     * @returns {V} 
     */
    get(v?:any):V;  
    /**
     * Adds an object to the pool. 
     * @param {V} v object to add 
     */
    put(v:V):void; 
}
/**
 * Creates an object pool to help with object reuse. 
 * This is to optimise garabage collection in JS application. 
 * @param {function} make an object generator function. If provided, the function will be called when no the pool is empty.
 * @returns {Pool}
 */
export function createPool<T>(make?:(...args:any[])=>T):Pool<T>{
	let pool:any[] = []; 
	function get(d?:any):T{
		if (pool.length === 0){
			let v = (make && make(d)) || {};
			return v as any; 
		}
		return pool.shift();
	}

	function put(o:T){
		pool.push(o); 
	}
	return {
		get,
		put,
	}
}