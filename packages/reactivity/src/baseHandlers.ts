import { isObject } from '@vue/shared';
import { track, trigger } from './effect';
import { reactive, ReactiveFlags } from './reactive';
import { isRef } from './ref';

export const mutTableHandlers = {
  get(target, key, receiver) {
    if (ReactiveFlags.IS_REACTIVE === key) {
      return target
    }
    track(target, key)
    const res = Reflect.get(target, key, receiver) // 处理了this指向问题
    if (isRef(res)) {
      return res.value
    }
    if (isObject(res)) { // 只有用户取值的时候 才会进行二次代理，不用担心性能
      return reactive(res)
    }
    return res
  },
  set(target, key, value, receiver) {
    // 用户赋值的操作
    let oldValue = target[key] // 没有修改之前的值
    const res = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      trigger(target, key, value, oldValue)
    }
    return res
  }
}