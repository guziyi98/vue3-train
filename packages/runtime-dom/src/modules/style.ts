export const patchStyle = (el, prev, next) => {
  if (next) {
    const style = el.style
    for (const key in next) {
      style[key] = next[key]
    }
    for (const key in prev) {
      // 新的没有，老的有，需要把老的有的删掉
      if (next[key] === null) {
        style[key] = null
      }
    }
  } else {
    el.removeAttribute('style') // 没有就移出style
  }
}