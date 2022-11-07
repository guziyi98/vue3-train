import { ShapeFlags } from '@vue/shared';
import { isSameVNode } from './vnode';
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

  const mountElement = (vnode, container, anchor) => {
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
    hostInsert(el, container, anchor)
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
    // 全量的diff算法 比对过程是深度遍历，先遍历父亲 再遍历孩子 从父 => 子 都要比对一遍
    // 目前没有优化比对 没有关系 只比对变化的部分 blockTree patchFlags
    // 同级比对 父和父比 子和子比 采用的是深度遍历
    let i = 0 // 默认从0 开始比对
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    // a b c
    // a b e d
    // i = 0, e1 = 2, e2 = 3
    // 从前面开始比对
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el) // 深度遍历
      } else {
        break
      }
      i++
    }
    // i = 2, e1 = 2, e2 = 3 a: 1 b: 2


    // 从后面开始比对
    // a b   c d
    // a b e c d
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el) // 深度遍历
      } else {
        break
      }
      e1--
      e2--
    }
    // i = 2, e1 = 1, e2 = 2

    // 我要知道 我是添加还是删除？ i 比 e1大说明新的长老的短
    // 同序列挂载
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          // 看一下 如果e2 往前移动了，那么e2的下一个值肯定存在，意味着向前插入
          // 如果e2没有动 那么e2 下一个就是空，意味着是向后插入
          const nextPos = e2 + 1
          // 保存之前的e2
          // vue2 是看下一个元素存不存在
          // vue3 是看下一个元素的长度 是否越界
          const anchor = nextPos < c2.length ? c2[nextPos].el : null
          patch(null, c2[i], el, anchor) // 没有判断是向前插入还是向后插入
          i++
        }
      }
    }
    // a b c d
    // a b    i = 2 e1 = 3 e2 = 1
    // 什么情况老得多 新的少
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    }

    // a b c d e   f g
    // a b e c d h f g
    let s1 = i // s1 => e1
    let s2 = i // s2 => e2
    // i = 2 e1 = 4 e2 = 5
    // 这里我们要复用老节点？ key vue2中根据老节点创建的索引表 vue3中根据新的key 做了一个映射表
    const keyToNewIndexMap = new Map()
    for (let i = s2; i <= e2; i++) {
      const vnode = c2[i]
      keyToNewIndexMap.set(vnode.key, i)
    }
    const toBePatched = e2 - s2 + 1
    const newIndexToOldMapIndex = new Array(toBePatched).fill(0) // [0,0,0,0]


    // 有了新的映射表后，去老的中查找一下，看一下是否存在，如果存在需要复用
    for (let i = s1; i <= e1; i++) {
      const child = c1[i]
      const newIndex = keyToNewIndexMap.get(child.key) // 通过老的key 来查找对应的新的索引
      // 如果newIndex有值说明有
      if (newIndex == undefined) {
        // 老的里面有 新的没有
        unmount(child)
      } else {
        // 比对两个属性
        // 如果前后两个能复用，则比较这两个节点
        newIndexToOldMapIndex[newIndex - s2] = i + 1
        patch(child, c2[newIndex], el)
      }
    }
    const seq = getSequence(newIndexToOldMapIndex)
    let j = seq.length - 1
    // 写到这里 我们已经复用了节点，并且更新了复用节点的属性，差移动操作，和新的里面有老的中没有的操作
    // 如何知道 新的里面有 老的里面没有 （老的没有映射表）
    for (let i = toBePatched - 1; i >= 0; i--) {
      // a b c d e   f g
      // a b e c d h f g
      const nextIndex = s2 + i // 下一个元素的索引
      const nextChild = c2[nextIndex] // 先拿到的h
      // 看一下h
      const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null
      if (newIndexToOldMapIndex[i] == 0) {
        // 找到新增的了
        // 创建元素再插入
        patch(null, nextChild, el, anchor)
      } else {
        // 直接做插入操作即可
        // 倒序插入
        if (i !== seq[j]) {
          hostInsert(nextChild.el, el, anchor) // insert是移动节点
          // 这个插入操作比较暴力，整个做了一次移动，但是我们需要优化不动的那一项
        } else {
          j-- // 不做移动跳过节点即可
        }
      }
    }
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
    const el = (nextNode.el = prevNode.el)
    const oldProps = prevNode.props || {}
    const newProps = nextNode.props || {}
    patchProps(oldProps, newProps, el)
    patchChildren(prevNode, nextNode, el)
  }

  const processElement = (prevNode, nextNode, container, anchor) => {

    if (prevNode === null) {
      // 初次渲染
      mountElement(nextNode, container, anchor)
    } else {
      // diff算法
      patchElement(prevNode, nextNode)
    }
  }

  const patch = (prevNode, nextNode, container, anchor = null) => {
    if (prevNode === nextNode) {
      return
    }
    if (prevNode && !isSameVNode(prevNode, nextNode)) {
      unmount(prevNode)
      prevNode = null
    }
    processElement(prevNode, nextNode, container, anchor)
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

function getSequence(arr) {
  let len = arr.length
  let result = [0]
  let resultLastIndex
  let start
  let end
  let middle
  let p = arr.slice(0) // 用来标识索引的
  for (let i = 0; i < len; i++) {
    let arrI = arr[i]
    if (arrI !== 0) { // vue序列中不会出现0 如果出现0可以忽略
      resultLastIndex = result[result.length - 1]
      if (arr[resultLastIndex] < arrI) {
        result.push(i)
        p[i] = resultLastIndex
        continue
      }
      // [1,2,3,4,5,6]
      // 这里就会出现 当前项比最后一项的值大 [0,1,2]
      start = 0
      end = result.length - 1
      while (start < end) {
        middle = (start + end) / 2 | 0 // | 0 === Math.floor()
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }
      // middle就是第一个比当前值大的值
      if (arrI < arr[result[start]]) {
        p[i] = result[start - 1] // 记住换的那个人的前一项的索引
        result[start] = i
      }
    }
  }
  // 追溯
  let i = result.length
  let last = result[i - 1] // 最后一项的索引
  while (i-- > 0) {
    result[i] = last // 用最后一项的索引来追溯
    last = p[last] // 用p中的索引来进行追溯
  }
  return result
}