import { proxyRefs, reactive } from '@vue/reactivity'
import { hasOwn, isFunction, ShapeFlags } from '@vue/shared'
import { initProps } from './componentProps'


export let currentInstance // 当前正在执行的实例

export function setCurrentInstance(instance) {
  // track
  currentInstance = instance
}

export function getCurrentInstance() {
  return currentInstance
}
export function createComponentInstance(vnode, parent) {
  let instance = {
    // 组件的实例
    data: null,
    isMounted: false,
    subTree: null,
    vnode,
    update: null, // 组件的更新方法 effect.run()
    props: {},
    attrs: {},
    propsOptions: vnode.type.props || {},
    proxy: null,
    setupState: null,
    exposed: {},
    slots: {},
    parent, // 父组件的实例
    provides: parent ? parent.provides : Object.create(null)
    // 组件的生命周期
    // 插槽
    // 组件的事件
  }
  return instance
}
const publicProperties = {
  $attrs: (i) => i.attrs,
  $props: (i) => i.props,
  $slots: (i) => i.slots
}
const PublicInstanceProxyHandlers = {
  get(target, key) {
    let { data, props, setupState } = target
    if (data && hasOwn(key, data)) {
      return data[key]
    } else if (hasOwn(key, props)) {
      return props[key]
    } else if (setupState && hasOwn(key, setupState)) {
      return setupState[key]
    }
    let getter = publicProperties[key]
    if (getter) {
      return getter(target)
    }
  },
  set(target, key, value) {
    let { data, props, setupState } = target
    if (hasOwn(key, data)) {
      data[key] = value
    } else if (hasOwn(key, props)) {
      console.log('warn...');
      return false
    } else if (setupState && hasOwn(key, setupState)) {
      setupState[key] = value
    }
    return true
  }
}

function initSlots(instance, children) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
    instance.slots = children // 将用户传递的插槽绑定到实例上
  }
}

export function setupComponent(instance) {
  // 组件的对象 render(component, {a: 1})
  const { type, props, children } = instance.vnode
  // h(组件的虚拟节点) => 用户写的对象 propsOptions, render
  // 组件的虚拟节点 就是渲染组件的时候传递的props
  // 用用户传递的props 和 把他解析成 attrs 和 props放到实例上
  initProps(instance, props)
  initSlots(instance, children)
  // 创建代理对象
  instance.proxy = new Proxy(instance, PublicInstanceProxyHandlers)
  const { setup } = type
  if (setup) {
    const setupContext = {
      attrs: instance.attrs,
      emit: (event, ...args) => {
        // myEvent => onMyEvent
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
        const handler = instance.vnode.props[eventName]
        handler && handler(...args)
      },
      expose(exposed) {
        instance.exposed = exposed // ref获取组件时拿到的就是exposed属性
      },
      slots: instance.slots
    }
    setCurrentInstance(instance)
    const setupResult = setup(instance.props, setupContext)
    setCurrentInstance(null)
    // setup返回的是render函数
    if (isFunction(setupResult)) {
      instance.render = setupResult
    } else {
      // 将返回的结果作为了数据集
      instance.setupState = proxyRefs(setupResult)
    }
  }
  const data = type.data
  if (data) {
    // vue2 传递的data
    if (isFunction(data)) {
      // 将用户传入的props转换成了data
      instance.data = reactive(data.call(instance.proxy))
    }
  }
  if (!instance.render) {
    instance.render = type.render // 将用户写的render作为实例
  }
}