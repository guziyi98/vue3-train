import { activeEffect, ReactiveEffect, trackEffects, triggerEffects } from './effect';
import { isFunction } from '@vue/shared';

const noop = () => {}

class ComputedRefImpl {
  dep = undefined
  effect = undefined
  __v_isRef = true // 意味着有这个熟悉，需要用.value来取值
  _dirty = true
  _value // 默认的缓存结果
  constructor (public getter, public setter) {
    this.effect = new ReactiveEffect(getter, () => {
      this._dirty = true
      triggerEffects(this.dep)
    })
  }
  get value () {
    if (activeEffect) {
      // 如果有activeEffect 意味着这个计算属性在effect中使用
      // 需要让计算属性收集这个effect
      trackEffects(this.dep || (this.dep = new Set()))
    }
    // 取值才执行，并且把取到的值缓存起来
    if (this._dirty) {
      this._value = this.effect.run()
      this._dirty = false // 意味着取过了
    }
    return this._value
  }
  set value (newValue) {
    this.setter(newValue)
  }
}
export function computed (getterOrOptions) {
  const onlyGetter = isFunction(getterOrOptions)
  let getter;
  let setter;
  // getter必须存在
  if (onlyGetter) {
    getter = getterOrOptions
    setter = noop
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set || noop
  }
  return  new ComputedRefImpl(getter, setter)
}

