import { Fragment } from './vnode';
import { h } from './h'
import { ref } from '@vue/reactivity';
export function defineAsyncComponent(options) {
  if (typeof options === 'function') {
    options = { loader: options }
  }
  let Component = null
  let timer = null
  return {
    setup() {
      let { loader } = options
      let loaded = ref(false)
      let error = ref(false)
      console.log(loader)
      loader().then((res) => {
        Component = res
        loaded.value = true
        clearTimeout(timer)
      }).catch(err => error.value = err)

      if (options.timeout) {
        timer = setTimeout(() => {
          error.value = true
        }, options.timeout);
      }

      return () => {
        console.log(loaded.value)
        if (loaded.value) {
          return h(Component)
        } else if (error.value && options.errorComponent) {
          return h(options.errorComponent)
        }
        return h(Fragment, [])
      }
    }
  }
}