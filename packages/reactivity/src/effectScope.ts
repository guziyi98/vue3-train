
export let activeEffectScope

class EffectScope {
  active = true
  effects = [] // 这是收集内部的effect
  parent = undefined
  scopes // 这个是收集作用域的
  constructor (detached = false) {
    if (!detached && activeEffectScope) {
      activeEffectScope.scopes || (activeEffectScope.scopes = []).push(this)
    }
  }
  run (fn) {
    if (this.active) {
      try {
        this.parent = activeEffectScope
        activeEffectScope = this
        return fn()
      } finally {
        // 清空了
        activeEffectScope = this.parent
        this.parent = null
      }
    }
  }
  stop () {
    if (this.active) {
      for (let index = 0; index < this.effects.length; index++) {
        const element = this.effects[index];
        element.stop() // 让每一个存储的effect全部终止
      }
    }
    if (this.scopes) {
      for (let index = 0; index < this.scopes.length; index++) {
        const element = this.scopes[index];
        element.stop() // 调用的是作用域的scope
      }
    }
    this.active = false
   }
}

export function recordEffectScope (effect) {
  if (activeEffectScope && activeEffectScope.active) {
    activeEffectScope.effects.push(effect)
  }
}
export function effectScope(detached) {
  return new EffectScope(detached)
}