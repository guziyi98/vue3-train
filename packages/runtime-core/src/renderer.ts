import { ShapeFlags } from '@vue/shared';
export function createRenderer (options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
  } = options

  const mountChildren = (children, el) =>  {
    if (children) {
      for (let i = 0; i < children.length; i++) {
        patch(null, children[i], el)
      }
    }
  }
  const mountElement = (vnode, container) => {
    const { type, props, children, shapeFlag } = vnode
    // 创建元素
    const el = (vnode.el = hostCreateElement(type))
    // 增添属性
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 处理子节点
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    }
    hostInsert(el, container)
  }
  const patch = (n1, n2, container) => {
    if (n1 === n2) {
      return
    }
    if (n1 === null) {
      // 初次渲染
      mountElement(n2, container)
    } else {
      // diff算法
    }
  }
  const render = (vnode, container) => {
    // vnode + dom api = 真实dom => 插入到container中
    if (vnode === null) {

    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode // 第一次渲染保存虚拟节点
  }
  return {
    // createRenderer 可以用户自定义渲染方式
    // createRenderer返回的render fn 接受参数是虚拟节点和容器
    render
  }
}