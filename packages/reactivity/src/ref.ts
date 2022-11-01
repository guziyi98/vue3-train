import { isObject } from '@vue/shared';
import { trackEffects, activeEffect, triggerEffects } from './effect';
import { reactive } from './reactive';

export function ref (value) {
  return new RefImpl(value)
}

function toReactive (value) {
  return isObject(value) ? reactive(value) : value
}
class RefImpl {
  dep = undefined
  __v_isRef = true
  _value
  constructor(public rawValue) {
    this._value = toReactive(rawValue)
  }

  get value () {
    // 依赖收集
    if (activeEffect) {
      trackEffects(this.dep || (this.dep = new Set()))
    }
    return this._value
  }

  set value (newValue) {
    if (newValue !== this.rawValue) {
      // 更新
      this._value = toReactive(newValue)
      this.rawValue = newValue
      // 触发更新
      triggerEffects(this.dep)
    }
  }
}