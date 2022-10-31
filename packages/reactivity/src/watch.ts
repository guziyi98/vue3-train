import { isReactive } from './reactive';

export function watch (source, cb) {
  let getter
  if (isReactive(source)) {
    // 最终都处理成函数
    getter = () => source
  }
}