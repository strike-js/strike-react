export interface PersistenceStrategy {
    put(key:string,data:any):Promise<any>;
    get(key:string):Promise<any>;
}