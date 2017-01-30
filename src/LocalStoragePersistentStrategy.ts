import {PersistenceStrategy} from './PersistenceStrategy'; 
export function localStorageStrategy():PersistenceStrategy{
    function get(key:string){
        return new Promise((resolve,rejct)=>{
            let v = localStorage.getItem(key); 
            return v && JSON.parse(v);
        });
    }

    function put(key:string,data:any){
        return new Promise((resolve,reject)=>{
            localStorage.setItem(key,JSON.stringify(data));
        });
    }

    return {
        get,
        put
    }
}