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
  const style = el.style;
  for (const key in next) {
    style[key] = next[key];
  }
  for (const key in prev) {
    if (next[key] === null) {
      style[key] = null;
    }
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

// packages/runtime-dom/src/index.ts
var renderOptions = Object.assign(nodeOps, { patchProp });
console.log(renderOptions);
//# sourceMappingURL=runtime-dom.esm.js.map
