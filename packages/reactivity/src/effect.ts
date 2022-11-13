import { recordEffectScope } from './effectScope'

export let activeEffect

// 每次执行依赖收集前，先做清除操作
function cleanupEffect(effect) {
  // 每次执行effect之前 我们应该清理掉effect中依赖的所有属性
  let { deps } = effect
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)
  }
  deps.length = 0
}
export class ReactiveEffect {
  public active = true
  public deps = []
  public parent = undefined
  constructor(public fn, private scheduler?) {
    recordEffectScope(this)
  }
  run() {
    if (!this.active) {
      return this.fn() // 直接执行此函数即可
    }
    // 其他情况下 意味着是激活状态
    try {
      this.parent = activeEffect
      activeEffect = this
      cleanupEffect(this)
      return this.fn() // 这个地方做了依赖收集
    } finally {
      activeEffect = this.parent
      this.parent = undefined
    }
  }
  stop() {
    if (this.active) {
      cleanupEffect(this) // 先将effect的依赖全部删除掉
      this.active = false // 再将其变成失活态
    }
  }
}
// 依赖收集 就是将当前的effect变成全局的 稍后取值的时候可以拿到这个全局的effect
export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  _effect.run() // 默认让响应式的effect执行一次
  const runner = _effect.run.bind(_effect) // 保证_effect执行的时候this是当前的effect
  runner.effect = _effect
  return runner
}

const targetMap = new WeakMap()
export function track(target, key) {
  if (!activeEffect) {
    // 取值操作没有发生在effect中
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // weakMap中的key只能是对象
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  trackEffects(dep)
  // let shouldTrack = !dep.has(activeEffect)
  // if (shouldTrack) {
  //   dep.add(activeEffect)
  //   activeEffect.deps.push(dep) // 后续需要通过effect来清理的时候可以去使用
  //   // 一个属性对应多个effect, 一个effect对应着多个属性
  //   // 属性和effect的关系是多对多
  // }
}

export function trackEffects(dep) {
  let shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep) // 后续需要通过effect来清理的时候可以去使用
    // 一个属性对应多个effect, 一个effect对应着多个属性
    // 属性和effect的关系是多对多
  }
}

export function trigger(target, key, value, oldValue) {
  // weakMap { obj: map{ key: set(effect) }}
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const dep = depsMap.get(key)
  if (dep) {
    triggerEffects(dep)
  }
}

export function triggerEffects(dep) {
  if (dep) {
    const effects = [...dep]
    effects.forEach(effect => {
      // 当我重新执行此effect，会将当前的effect放到全局上,应该放到 activeEffect 上
      if (activeEffect !== effect) {
        if (effect.scheduler) {
          effect.scheduler()
        } else {
          effect.run()
        }
      }
    })
  }
}
