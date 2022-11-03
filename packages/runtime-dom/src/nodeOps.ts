// 元素的增删改查，查找关系，文本的增删改查
export const nodeOps = {
  createElement (tagName) {
    return document.createElement(tagName)
  },
  insert (child, parent, anchor) {
    // insertBefore 移动性的, A B C D => A C B D 是把C移动到了B的前面
    parent.insertBefore(child, anchor || null)
  },
  remove (child) {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  querySelector (selector) {
    return document.querySelector(selector)
  },
  parentNode (node) {
    return node.parentNode
  },
  nextSibling (node) {
    return node.nextSibling
  },
  setElementText (el, text) {
    el.textContent = text
  },
  createText (text) {
    return document.createTextNode(text)
  },
  setText (node, value) {
    node.nodeValue = value
  }
}