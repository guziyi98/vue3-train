export const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, operators) {
    // 初始化会调用
    const { mountChildren, patchChildren, move, hostQuerySelector, query } = operators
    if (!n1) {
      const target = (n2.target = query(n2.props.to))
      if (target) {
        mountChildren(n2.children, target, anchor)
      }
    } else {
      patchChildren(n1, n2, n1.target)
      n2.target = n1.target
      if (n1.props.to !== n2.props.to) {
        const nextNode = (n2.target = query(n2.props.to))
        n2.children.forEach(child => move(child, nextNode, anchor))
      }
    }
  }
}

export const isTeleport = (type) => !!type.__isTeleport