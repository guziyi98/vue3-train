import { activeEffect, track } from './effect';
import { ReactiveFlags } from './reactive';

export const mutTableHandlers = {
  get (target, key, receiver) {
    if (ReactiveFlags.IS_REACTIVE === key) {
      return target
    }
    track(target, key)
    return Reflect.get(target, key, receiver) // 处理了this指向问题 
  },
  set (target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver)
  }
}