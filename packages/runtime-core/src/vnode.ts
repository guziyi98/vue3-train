import { isString, ShapeFlags } from '@vue/shared';


export function isVNode(vnode) {
  return vnode.__v_isVnode === true
}

export function isSameVNode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}
export function createVNode(type, props = null, children = null) {
  // 组件
  // 元素
  // 文本
  // 自定义的keep-alive...
  // 用表示来区分 对应的虚拟节点类型  这个表示采用的位运算的方式 可以方便组合
  // 

  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0

  const vnode = {
    __v_isVnode: true, // 添加标识是不是vnode
    type,
    props,
    children,
    shapeFlag,
    key: props?.key,
    el: null, // 对应的真实节点
  }
  if (children) {
    let type = 0
    if (Array.isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN
    } else {
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
  }
  return vnode
}