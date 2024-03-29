export async function sleep(t=1000){
  return new Promise((resolve)=>{
    setTimeout(resolve,t)
  })
}

export function selfish (target) {
  const cache = new WeakMap();
  const handler = {
    get (target, key) {
      const value = Reflect.get(target, key);
      if (typeof value !== 'function') {
        return value;
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target));
      }
      return cache.get(value);
    }
  };
  const proxy = new Proxy(target, handler);
  return proxy;
}

export function objectSetValue(obj,path,value,separator) {
  let i
  path = path.split(separator)
  for (i = 0; i < path.length - 1; i++){
    if(!(path[i] in obj)) throw Error('path not exist')
    obj = obj[path[i]];
  }
  obj[path[i]] = value;
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export function getCurrentTimestamp(){
  return new Date().getTime()
}

// wx method to promise
export const toPromise = <R, P = {}>(func:any, options?:P, returnKey?:string): Promise<R> => {
  return new Promise((resolve,reject)=>{
    func({
      ...options,
      success: res=>{
        if(func.noLog){

        }else{
          if(res.data && res.data.length > 200){
            console.warn(`${func.name}:`, res.data.slice(-200))
          }else{
            console.warn(`${func.name}:`, res);
          }
        }
       
        if(returnKey && res.hasOwnProperty(returnKey)){
          resolve(res[returnKey])
        }else{
          resolve(res)
        }
      },
      fail: reject
    })
  })
}

export default {
  sleep,
  toPromise,
  mergeDeep,
  selfish,
  objectSetValue,
  getCurrentTimestamp
}