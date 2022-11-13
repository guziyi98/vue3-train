
const createInvoker = (initialValue) => {
  const invoker = (e) => invoker.value(e)
  invoker.value = initialValue
  return invoker
}

// 函数更新成新的函数了 直接更改.value即可
export const patchEvent = (el, key, nextValue) => {
  const invokers = el._vei || (el._vei = {})
  const name = key.slice(2).toLowerCase()
  const existingInvoker = invokers[name]
  if (nextValue && existingInvoker) {
    // 更新事件
    existingInvoker.value = nextValue
  } else {
    if (nextValue) {
      // 缓存创建的invoker
      const invoker = (invokers[name] = createInvoker(nextValue))
      el.addEventListener(name, invoker)
    } else if (existingInvoker) {
      el.removeEventListener(name, existingInvoker)
      invokers[name] = null
    }
  }
}