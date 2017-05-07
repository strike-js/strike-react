/**
 * A persistence strategy for the state container. 
 */
export interface PersistenceStrategy {
    /**
     * Save data at a given key.
     * @param {string} key the key to store the data at. 
     * @param {any} data the data to store. 
     * @returns {Promise<any>} 
     */
    put<T>(key:string,data:T):Promise<any>;
    /**
     * Save data at a given key. 
     * @param {string} key the key to store the data at. 
     * @param {any} data the data to store. 
     * @param {function} cb a callback after. 
     */
    put<T>(key:string,data:T,cb:(err:Error,data?:any)=>void):void;
    /**
     * Returns a state at a given key 
     * @param {string} key the key to retrieve its data.
     * @returns {Promise<any>} a promise resolving to the data. 
     */
    get<T>(key:string):Promise<T>;
    /**
     * Returns a state at a given key 
     * @param {string} key the key to retrieve its data. 
     * @param {function} cb a NodeJS style callback with error as its first param, and the data as its second. 
     */
    get<T>(key:string,cb:(err:Error,data:T)=>void):void
}


export interface FunctionalPersistenceStrategy<T>{
    /**
     * A function to rertrieve data from a persistence store. 
     * @param {string} key the key to the data. 
     * @param {function} cb a NodeJS style callback with error as its first param, and the data as its second. 
     */
	(key:string,cb:(err:Error,data:T)=>void):void; 
    /**
     * A function persistence strategy to store data in a persistence store. 
     * @param {string} key the key to the data. 
     * @param {any} data the data to store. 
     * @param {function} cb a NodeJS style callback with error as its first param, and the data as its second. 
     */
	(key:string,val:T,cb:(err:Error,data?:any)=>void):void; 
}