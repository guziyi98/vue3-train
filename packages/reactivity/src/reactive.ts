
import { isObject } from '@vue/shared';
import { mutTableHandlers } from './baseHandlers';

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}



const reactiveMap = new WeakMap()
export function reactive (target) {
  // typeof object入参只能是对象 
  if(!isObject(target)) {
    return target
  }
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }
  // 缓存下代理过的obj，下次再进行代理的时候直接拿出来用
  const existsProxy = reactiveMap.get(target)
  if (existsProxy) {
    return existsProxy
  }
  // 代理，我通过代理对象操作属性，就会去源对象上进行截取
  const proxy = new Proxy(target, mutTableHandlers)
  // 缓存一下 代理过的对象，下次再进行代理的时候直接拿出来用即可
  // target => proxy
  reactiveMap.set(target, proxy)
  return proxy
}