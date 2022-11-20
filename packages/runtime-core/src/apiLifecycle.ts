import { currentInstance, setCurrentInstance } from './component'

export const enum LifecycleHooks {
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u'
}

// bm = []
// m = []
// bu = []
// u = []

function createHook(type) {
  // type是绑定到哪里，hook就是用户传递的钩子，获取当前的实例
  // instance[type] = [hook, hook ]
  return (hook, target = currentInstance) => {
    if (target) { // 生命周期 必须在setup中使用
      const hooks = target[type] || (target[type] = [])
      const wrapperHook = () => {
        setCurrentInstance(target)
        hook()
        setCurrentInstance(null)
      }
      hooks.push(wrapperHook)
    }
  }
}

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifecycleHooks.UPDATED)