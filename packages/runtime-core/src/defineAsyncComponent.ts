import { Fragment } from './vnode';
import { h } from './h'
import { ref } from '@vue/reactivity';
export function defineAsyncComponent(options) {
  if (typeof options === 'function') {
    options = { loader: options }
  }
  let Component = null
  let timerError = null
  let timerLoading = null
  return {
    setup() {
      let { loader, timeout, errorComponent, delay, loadingComponent, onError } = options

      let loaded = ref(false)
      let error = ref(false)
      let loading = ref(false)
      console.log(loader)
      const load = () => {
        return loader().catch((err) => {
          if (onError) {
            return new Promise((res, rej) => {
              // resolve 一个promise
              // 一个promise会等待另一个promise执行完毕
              const retry = () => res(load())
              onError(err, retry)
            })
          } else {
            throw err
          }
        })
      }
      if (delay) {
        timerLoading = setTimeout(() => {
          loading.value = true
        }, delay);
      }

      load().then((res) => {
        Component = res
        loaded.value = true
        if (timerError) {
          clearTimeout(timerError)
        }
      }).catch((err) => (error.value = err))
        .finally(() => {
          loading.value = false
          clearTimeout(timerLoading)
        })


      if (timeout) {
        timerError = setTimeout(() => {
          error.value = true
        }, timeout);
      }

      return () => {
        if (loaded.value) {
          return h(Component) // 成功组件
        }
        else if (error.value && errorComponent) {
          return h(errorComponent) // 错误组件
        } else if (loading.value && loadingComponent) {
          return h(loadingComponent) // loading组件
        }
        return h(Fragment, [])
      }
    }
  }
}