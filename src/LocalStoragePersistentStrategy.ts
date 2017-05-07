import {PersistenceStrategy} from './PersistenceStrategy'; 
/**
 * Creates a persistence storage based on the localStorage. 
 * @returns {PersistenceStrategy}
 */
export function localStorageStrategy():PersistenceStrategy{
    function get(key:string){
        return new Promise((resolve,reject)=>{
            let v = localStorage.getItem(key); 
            if (v){
                resolve(JSON.parse(v));
                return;
            }
            reject();
        });
    }

    function put(key:string,data:any){
        return new Promise((resolve,reject)=>{
            localStorage.setItem(key,JSON.stringify(data));
            resolve();
        });
    }

    return {
        get,
        put
    }
}