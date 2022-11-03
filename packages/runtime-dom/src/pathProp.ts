import { patchAttr } from './modules/attr'
import { patchClass } from './modules/class'
import { patchEvent } from './modules/event'
import { patchStyle } from './modules/style'




export const patchProp = (el, key, prevValue, nextValue) => {
  const CLASS = 'class'
  const STYLE = 'style'
  const reg = /^on[^a-z]/
  if (key === CLASS) {
    patchClass(el, nextValue)
  } else if (key === STYLE) {
    patchStyle(el, prevValue, nextValue)
  } else if (reg.test(key)) { // 事件
    patchEvent(el, key, nextValue)
  } else {
    patchAttr(el, key, nextValue)
  }
}