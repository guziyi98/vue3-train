import {
  createRenderer,
  h,
  getCurrentInstance,
  render,
  onMounted,
  defineAsyncComponent,
  Text,
} from '/node_modules/@vue/runtime-dom/dist/runtime-dom.esm-browser.js'
export default {
  render() {
    return h(Text, 'hello world 11')
  }
}