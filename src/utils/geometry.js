// 俯视图几何指标计算（前端精确计算，最可靠）

export function distance(a, b) {
  const ax = a?.x ?? 0, ay = a?.y ?? 0
  const bx = b?.x ?? 0, by = b?.y ?? 0
  return Math.hypot(ax - bx, ay - by)
}

// 输入：俯视图四个极值点 {front,back,left,right}，坐标为像素
// 输出：头颅指数 CI、颅顶不对称指数
export function calcTopMetrics(p) {
  if (!p || !p.left || !p.right || !p.front || !p.back) return null
  const width = distance(p.left, p.right)
  const length = distance(p.front, p.back)
  if (width <= 0 || length <= 0) return null

  const ci = (width / length) * 100

  // 两条对角线：左前-右后、右前-左后
  const diag1 = distance(p.front, p.left)
  const diag2 = distance(p.back, p.right)
  const maxDiag = Math.max(diag1, diag2)
  const asymmetry = maxDiag > 0 ? (Math.abs(diag1 - diag2) / maxDiag) * 100 : 0

  return {
    ci: Math.round(ci * 10) / 10,
    asymmetry: Math.round(asymmetry * 10) / 10
  }
}
