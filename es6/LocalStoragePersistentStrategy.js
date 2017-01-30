export function localStorageStrategy() {
    function get(key) {
        return new Promise((resolve, rejct) => {
            let v = localStorage.getItem(key);
            return v && JSON.parse(v);
        });
    }
    function put(key, data) {
        return new Promise((resolve, reject) => {
            localStorage.setItem(key, JSON.stringify(data));
        });
    }
    return {
        get,
        put
    };
}
