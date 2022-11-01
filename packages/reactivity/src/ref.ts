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


class ObjectRefImpl {
  __v_isRef = true
  constructor (public _object, public _key) {

  }
  get value () {
    return this._object[this._key]
  }

  set value (newValue) {
    this._object[this._key] = newValue
  }
}

export function toRef (target, key) {
  return new ObjectRefImpl(target, key)
}

export function toRefs (target) {
  let res = {}
  for (const key in target) {
    res[key] = toRef(target, key)
  }
  return res
}

// 需要加个 .value
export function proxyRefs (objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get (target, key, receiver) {
      const v = Reflect.get(target, key, receiver)
      return v.__v_isRef ? v.value : v
    },
    set (target, key, value, receiver) {
      const oldValue = target[key]
      if (oldValue.__v_isRef) {
        oldValue.value = value
        return true
      }
      return Reflect.set(target, key, value, receiver)
    }
  })
}

// computed ref toRef toRefs watch watchEffect proxyRefs