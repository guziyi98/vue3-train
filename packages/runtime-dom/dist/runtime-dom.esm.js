// packages/runtime-dom/src/nodeOps.ts
var nodeOps = {
  createElement(tagName) {
    return document.createElement(tagName);
  },
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null);
  },
  remove(child) {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  querySelector(selector) {
    return document.querySelector(selector);
  },
  parentNode(node) {
    return node.parentNode;
  },
  nextSibling(node) {
    return node.nextSibling;
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(node, value) {
    node.nodeValue = value;
  }
};

// packages/runtime-dom/src/modules/attr.ts
var patchAttr = (el, key, nextValue) => {
  if (nextValue === null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextValue);
  }
};

// packages/runtime-dom/src/modules/class.ts
var patchClass = (el, newValue) => {
  if (newValue === null) {
    el.removeAttribute("class");
  } else {
    el.className = newValue;
  }
};

// packages/runtime-dom/src/modules/event.ts
var createInvoker = (initialValue) => {
  const invoker = (e) => invoker.value(e);
  invoker.value = initialValue;
  return invoker;
};
var patchEvent = (el, key, nextValue) => {
  const invokers = el._vei || (el._vei = {});
  const name = key.slice(2).toLowercase();
  const existingInvoker = invokers[name];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    if (nextValue) {
      const invoker = invokers[name] = createInvoker(nextValue);
      el.addEventListener(name, invoker);
    } else if (existingInvoker) {
      el.removeEventListener(name, existingInvoker);
      invokers[name] = null;
    }
  }
};

// packages/runtime-dom/src/modules/style.ts
var patchStyle = (el, prev, next) => {
  if (next) {
    const style = el.style;
    for (const key in next) {
      style[key] = next[key];
    }
    for (const key in prev) {
      if (next[key] === null) {
        style[key] = null;
      }
    }
  } else {
    el.removeAttribute("style");
  }
};

// packages/runtime-dom/src/pathProp.ts
var patchProp = (el, key, prevValue, nextValue) => {
  const CLASS = "class";
  const STYLE = "style";
  const reg = /^on[^a-z]/;
  if (key === CLASS) {
    patchClass(el, nextValue);
  } else if (key === STYLE) {
    patchStyle(el, prevValue, nextValue);
  } else if (reg.test(key)) {
    patchEvent(el, key, nextValue);
  } else {
    patchAttr(el, key, nextValue);
  }
};

// packages/shared/src/index.ts
function isObject(value) {
  return value !== null && typeof value === "object";
}
function isString(value) {
  return typeof value === "string";
}

// packages/runtime-core/src/vnode.ts
function isVNode(vnode) {
  return vnode.__v_isVnode === true;
}
function isSameVNode(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
function createVNode(type, props = null, children = null) {
  const shapeFlag = isString(type) ? 1 /* ELEMENT */ : 0;
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    shapeFlag,
    key: props == null ? void 0 : props.key,
    el: null
  };
  if (children) {
    let type2 = 0;
    if (Array.isArray(children)) {
      type2 = 16 /* ARRAY_CHILDREN */;
    } else {
      type2 = 8 /* TEXT_CHILDREN */;
    }
    vnode.shapeFlag |= type2;
  }
  return vnode;
}

// packages/runtime-core/src/h.ts
function h(type, propsOrChildren, children) {
  const l = arguments.length;
  if (l === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]);
      }
      return createVNode(type, propsOrChildren);
    } else {
      return createVNode(type, null, propsOrChildren);
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }
    return createVNode(type, propsOrChildren, children);
  }
}

// packages/runtime-core/src/renderer.ts
function createRenderer(options) {
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
    nextSibling: hostNextSibling
  } = options;
  const mountChildren = (children, el) => {
    if (children) {
      for (let i = 0; i < children.length; i++) {
        patch(null, children[i], el);
      }
    }
  };
  const unmountChildren = (children) => {
    if (children) {
      for (let i = 0; i < children.length; i++) {
        unmount(children[i]);
      }
    }
  };
  const mountElement = (vnode, container, anchor) => {
    const { type, props, children, shapeFlag } = vnode;
    const el = vnode.el = hostCreateElement(type);
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
      mountChildren(children, el);
    } else if (shapeFlag & 8 /* TEXT_CHILDREN */) {
      hostSetElementText(el, children);
    }
    hostInsert(el, container, anchor);
  };
  const patchProps = (oldProps, newProps, el) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];
        if (prev !== next) {
          hostPatchProp(el, key, prev, next);
        }
      }
      for (const key in oldProps) {
        const prev = oldProps[key];
        if (!(key in newProps)) {
          hostPatchProp(el, key, prev, null);
        }
      }
    }
  };
  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          patch(null, c2[i], el, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    }
    let s1 = i;
    let s2 = i;
    const keyToNewIndexMap = /* @__PURE__ */ new Map();
    for (let i2 = s2; i2 <= e2; i2++) {
      const vnode = c2[i2];
      keyToNewIndexMap.set(vnode.key, i2);
    }
    const toBePatched = e2 - s2 + 1;
    const newIndexToOldMapIndex = new Array(toBePatched).fill(0);
    for (let i2 = s1; i2 <= e1; i2++) {
      const child = c1[i2];
      const newIndex = keyToNewIndexMap.get(child.key);
      if (newIndex == void 0) {
        unmount(child);
      } else {
        newIndexToOldMapIndex[newIndex - s2] = i2 + 1;
        patch(child, c2[newIndex], el);
      }
    }
    const seq = getSequence(newIndexToOldMapIndex);
    let j = seq.length - 1;
    for (let i2 = toBePatched - 1; i2 >= 0; i2--) {
      const nextIndex = s2 + i2;
      const nextChild = c2[nextIndex];
      const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
      if (newIndexToOldMapIndex[i2] == 0) {
        patch(null, nextChild, el, anchor);
      } else {
        if (i2 !== seq[j]) {
          hostInsert(nextChild.el, el, anchor);
        } else {
          j--;
        }
      }
    }
  };
  const patchChildren = (oldProps, newProps, el) => {
    const c1 = oldProps.children;
    const c2 = newProps.children;
    const prevShapeFlag = oldProps.shapeFlag;
    const nextShapeFlag = newProps.shapeFlag;
    if (nextShapeFlag & 8 /* TEXT_CHILDREN */) {
      if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        hostSetElementText(el, c2);
      }
    } else {
      if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
        if (nextShapeFlag & 16 /* ARRAY_CHILDREN */) {
          patchKeyedChildren(c1, c2, el);
        } else {
          unmountChildren(c1);
        }
      } else {
        if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
          hostSetElementText(el, "");
        }
        if (nextShapeFlag & 16 /* ARRAY_CHILDREN */) {
          mountChildren(c2, el);
        }
      }
    }
  };
  const patchElement = (prevNode, nextNode) => {
    const el = nextNode.el = prevNode.el;
    const oldProps = prevNode.props || {};
    const newProps = nextNode.props || {};
    patchProps(oldProps, newProps, el);
    patchChildren(prevNode, nextNode, el);
  };
  const processElement = (prevNode, nextNode, container, anchor) => {
    if (prevNode === null) {
      mountElement(nextNode, container, anchor);
    } else {
      patchElement(prevNode, nextNode);
    }
  };
  const patch = (prevNode, nextNode, container, anchor = null) => {
    if (prevNode === nextNode) {
      return;
    }
    if (prevNode && !isSameVNode(prevNode, nextNode)) {
      unmount(prevNode);
      prevNode = null;
    }
    processElement(prevNode, nextNode, container, anchor);
  };
  const unmount = (vnode) => hostRemove(vnode.el);
  const render2 = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode);
      }
    } else {
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };
  return {
    render: render2
  };
}
function getSequence(arr) {
  let len = arr.length;
  let result = [0];
  let resultLastIndex;
  let start;
  let end;
  let middle;
  let p = arr.slice(0);
  for (let i2 = 0; i2 < len; i2++) {
    let arrI = arr[i2];
    if (arrI !== 0) {
      resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < arrI) {
        result.push(i2);
        p[i2] = resultLastIndex;
        continue;
      }
      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = (start + end) / 2 | 0;
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      if (arrI < arr[result[start]]) {
        p[i2] = result[start - 1];
        result[start] = i2;
      }
    }
  }
  let i = result.length;
  let last = result[i - 1];
  while (i-- > 0) {
    result[i] = last;
    last = p[last];
  }
  return result;
}

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign(nodeOps, { patchProp });
var render = (vnode, container) => {
  return createRenderer(renderOptions).render(vnode, container);
};
export {
  createRenderer,
  createVNode,
  h,
  isSameVNode,
  isVNode,
  render
};
//# sourceMappingURL=runtime-dom.esm.js.map
