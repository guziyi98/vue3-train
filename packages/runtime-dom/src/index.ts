// import { render } from './index';
// 对元素可以进行节点操作
import { nodeOps } from './nodeOps';
import { patchProp } from './pathProp';
import { createRenderer } from '@vue/runtime-core'
const renderOptions = Object.assign(nodeOps, { patchProp })

export const render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container)
}
export * from "@vue/runtime-core"
export * from "@vue/reactivity"