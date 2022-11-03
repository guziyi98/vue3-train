


// 对元素可以进行节点操作

import { nodeOps } from './nodeOps';
import { patchProp } from './pathProp';
const renderOptions = Object.assign(nodeOps, { patchProp })
console.log(renderOptions);
