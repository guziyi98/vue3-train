// 最长递增子序列

// 最优情况 [1,2,3,4,5,6] => [0,1,2,3,4,5]


// 先找递增子序列的长度 采用二分查找 + 贪心算法

// 3 4 5 9 7 6 2 1 8 11

// 3
// 3 4
// 3 4 5
// 3 4 5 9
// 3 4 5 7
// 3 4 5 6
// 2 4 5 6
// 1 4 5 6
// 1 4 5 6 8
// 1 4 5 6 8 11 个数ok 这个可以通过前驱节点来进行修复操作

function getSequence(arr) {
  let len = arr.length
  let result = [0]
  let resultLastIndex
  let start
  let end
  let middle
  let p = arr.slice(0) // 用来标识索引的
  for (let i = 0; i < len; i++) {
    let arrI = arr[i]
    if (arrI !== 0) { // vue序列中不会出现0 如果出现0可以忽略
      resultLastIndex = result[result.length - 1]
      if (arr[resultLastIndex] < arrI) {
        result.push(i)
        p[i] = resultLastIndex
        continue
      }
      // [1,2,3,4,5,6]
      // 这里就会出现 当前项比最后一项的值大 [0,1,2]
      start = 0
      end = result.length - 1
      while (start < end) {
        middle = (start + end) / 2 | 0 // | 0 === Math.floor()
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }
      // middle就是第一个比当前值大的值
      if (arrI < arr[result[start]]) {
        p[i] = result[start - 1] // 记住换的那个人的前一项的索引
        result[start] = i
      }
    }
  }
  // 追溯
  let i = result.length
  let last = result[i - 1] // 最后一项的索引
  while (i-- > 0) {
    result[i] = last // 用最后一项的索引来追溯
    last = p[last] // 用p中的索引来进行追溯
  }
  return result
}
// let arr = [1, 2, 3, 4, 5, 6]
let arr2 = [2, 5, 8, 4, 6, 7, 9, 3]
let result = getSequence(arr2)
console.log(result);