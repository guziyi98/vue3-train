import { isObject } from '@vue/shared';
import { createVNode, isVNode } from './vnode';

// 提供多样的api 根据参数来区分

export function h (type, propsOrChildren?, children?) {
  const l = arguments.length

  if (l === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      }
      return createVNode(type, propsOrChildren)
    } else {
      // 数组 or 文本
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    if (l > 3) {
      // h('div', {}, 'a','b','c') 这样操作第二个参数必须是属性 h('div','e','a','b','c')
      children = Array.from(arguments).slice(2)
    } else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}