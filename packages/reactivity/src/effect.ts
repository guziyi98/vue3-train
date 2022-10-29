
export let activeEffect
class ReactiveEffect {
  public active = true
  public deps = []
  public parent = undefined
  constructor(public fn) {
    this.fn = fn
  }
  run () {
    if (!this.active) {
      return this.fn() // 直接执行此函数即可
    }
    // 其他情况下 意味着是激活状态
    try {
      this.parent = activeEffect
      activeEffect = this
      return this.fn() // 会取响应式的属性
    } finally {
      activeEffect = this.parent
      this.parent = undefined
    }
  }
}
// 依赖收集 就是将当前的effect变成全局的 稍后取值的时候可以拿到这个全局的effect
export function effect (fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run() // 默认让响应式的effect执行一次
}

// let mapping = {
//   target: {
//     name: [activeEffect, activeEffect, activeEffect]
//   }
// }
const targetMap = new WeakMap()
export function track (target, key) {
  if (!activeEffect) {
    // 取值操作没有发生在effect中
    return
  }
  debugger;
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // weakMap中的key只能是对象
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  let shouldTrack = !dep.has(activeEffect)
  if (shouldTrack) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep) // 后续需要通过effect来清理的时候可以去使用
    // 一个属性对应多个effect, 一个effect对应着多个属性
    // 属性和effect的关系是多对多
  }
}