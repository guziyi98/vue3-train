import { currentInstance } from './component';
export function provide(key, value) {
  // 如何判断是否在组件中？
  if (!currentInstance) return
  let { provides } = currentInstance

  const parentProvides = currentInstance.parent && currentInstance.parent.provides
  if (provides === parentProvides) {
    provides = currentInstance.provides = Object.create(provides)
  }
  provides[key] = value

  console.log(currentInstance.provides)

  return provides
}
export function inject(key, value) {
  if (!currentInstance) return
  const provides = currentInstance?.parent.provides
  if (provides && key in provides) {
    return provides[key]
  } else if (value) {
    return value
  }
}