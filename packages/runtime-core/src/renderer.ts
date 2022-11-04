import { ShapeFlags } from '@vue/shared';
import { isSaveVNode } from './vnode';
export function createRenderer(options) {
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

  const mountChildren = (children, el) => {
    if (children) {
      for (let i = 0; i < children.length; i++) {
        patch(null, children[i], el)
      }
    }
  }
  const unmountChildren = (children) => {
    if (children) {
      for (let i = 0; i < children.length; i++) {
        unmount(children[i])
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

  const patchProps = (oldProps, newProps, el) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]
        if (prev !== next) {
          hostPatchProp(el, key, prev, next)
        }
      }
      for (const key in oldProps) {
        const prev = oldProps[key]
        if (!(key in newProps)) {
          hostPatchProp(el, key, prev, null)
        }
      }
    }
  }

  const patchKeyedChildren = (c1, c2, el) => {

  }

  const patchChildren = (oldProps, newProps, el) => {
    // 比较新老孩子的差异，更新到el上

    const c1 = oldProps.children
    const c2 = newProps.children
    const prevShapeFlag = oldProps.shapeFlag
    const nextShapeFlag = newProps.shapeFlag

    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1)
      }
      if (c1 !== c2) {
        // 文本内容不相同
        hostSetElementText(el, c2)
      }
    } else {
      // 老儿子是数组，新的是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff算法
          patchKeyedChildren(c1, c2, el)
        } else {
          // 老的是数组，新的不是数组，删除老的
          unmountChildren(c1)
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '')
        }
        if (nextShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el)
        }
      }
    }
  }
  const patchElement = (prevNode, nextNode) => {
    const el = nextNode.el = prevNode.el
    const oldProps = prevNode.props || {}
    const newProps = nextNode.props || {}
    patchProps(oldProps, newProps, el)
    patchChildren(oldProps, newProps, el)
  }

  
  const processElement = (prevNode, nextNode, container) => {
    if (prevNode === null) {
      // 初次渲染
      mountElement(nextNode, container)
    } else {
      // diff算法
      patchElement(prevNode, nextNode)
    }
  }
  const patch = (prevNode, nextNode, container) => {
    if (prevNode === nextNode) {
      return
    }
    if (prevNode && !isSaveVNode(prevNode, nextNode)) {
      unmount(prevNode)
      prevNode = null
    }
    processElement(prevNode, nextNode, container)
  }

  const unmount = (vnode) => hostRemove(vnode.el)
  const render = (vnode, container) => {
    // vnode + dom api = 真实dom => 插入到container中
    if (vnode === null) {
      // 卸载，删除节点
      if (container._vnode) {
        unmount(container._vnode)
      }
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