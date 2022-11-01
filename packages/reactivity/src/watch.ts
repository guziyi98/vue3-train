import { isObject, isFunction } from '@vue/shared';
import { ReactiveEffect } from './effect';
import { isReactive } from './reactive';


function traverse (source, s = new Set()) {
  if (!isObject(source)) {
    return source
  }
  if (s.has(source)) {
    return source
  }
  s.add(source)
  // 考虑循环引用的问题，采用set解决
  for (const key in source) {
    traverse(source[key], s) // 递归取值
  }
  return source
}

export function doWatch (source, cb, { immediate } = {} as any) {
  let getter
  if (isReactive(source)) {
    // 最终都处理成函数
    getter = () => traverse(source) // 直接稍后调用run的时候会执行此函数，直接返回对象，只有访问属性才能依赖收集
  } else if (isFunction(source)) {
    getter = source
  }
  let oldValue
  let cleanup
  const onCleanup = userCb => {
    cleanup = userCb
  }
  const job = () => {
    if (cb) { // watch api
      // 内部要调用cb， 也就是watch的回调
      const newValue = effect.run()
      if (cleanup) cleanup()
      cb(newValue, oldValue, onCleanup)
      oldValue = newValue
    } else {
      effect.run() // watchEffect api
    }
  }
  // watch 本身就是一个effect + scheduler
  // watchEffect 就是一个effect, 有了watchEffect就不需要写依赖的数据了
  const effect = new ReactiveEffect(getter, job)
  if (immediate) {
    return job()
  }
  oldValue = effect.run() // 保留老值
}

export function watch (source, cb, options) {
  doWatch(source, cb, options)
}

export function watchEffect (source, options) {
  doWatch(source, null, options)
}