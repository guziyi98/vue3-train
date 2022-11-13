import { reactive } from '@vue/reactivity';

export function initProps(instance, rawProps) {
  const props = {}
  const attrs = {}
  const options = instance.propsOptions
  if (rawProps) {
    for (let key in rawProps) {
      const value = rawProps[key]
      if (key in options) {
        props[key] = value // 这就是属性
      } else {
        attrs[key] = value
      }
    }
  }
  instance.props = reactive(props)
  instance.attrs = attrs
}