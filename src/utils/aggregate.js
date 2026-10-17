// 多组评估结果聚合（多次拍摄取平均 / 取最保守）
// 设计：可计算的几何指标取平均；level 取最严重；红线取 OR；shapeType 取多数；建议去重合并。
import { classify } from './classify.js'

const RANK = { normal: 0, mild: 1, moderate: 2, severe: 3 }

function avg(nums) {
  const v = (nums || []).filter((n) => typeof n === 'number' && !Number.isNaN(n))
  if (!v.length) return undefined
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10
}

// groupResults: 单组评估结果数组；ageMonths 用于综合分级
export function aggregateResults(groupResults, ageMonths = 0) {
  if (!Array.isArray(groupResults) || !groupResults.length) return null
  if (groupResults.length === 1) return { ...groupResults[0], _groups: 1, _averaged: false }

  const metrics = {
    ci: avg(groupResults.map((r) => r.metrics?.ci)),
    asymmetry: avg(groupResults.map((r) => r.metrics?.asymmetry)),
    sideFlatness: avg(groupResults.map((r) => r.metrics?.sideFlatness)),
    earOffset: avg(groupResults.map((r) => r.metrics?.earOffset)),
    obliqueSeverity: avg(groupResults.map((r) => r.metrics?.obliqueSeverity))
  }

  // 红线：任一组疑似则疑似
  const suspectedSynostosis = groupResults.some((r) => r.redFlags?.suspectedSynostosis)
  const signs = [...new Set(groupResults.flatMap((r) => r.redFlags?.signs || []))]

  // shapeType：取出现最多的
  const counts = {}
  groupResults.forEach((r) => {
    const s = r.shapeType || 'normal'
    counts[s] = (counts[s] || 0) + 1
  })
  const shapeType = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'normal'

  // 综合分级：用平均指标重新分类，并与各组最严重 level 取更严重者
  const cls = classify({
    metrics,
    shapeType,
    ageMonths,
    redFlags: { suspectedSynostosis, signs }
  })
  const worstLevel = groupResults
    .map((r) => r.level)
    .reduce((a, b) => (RANK[b] > RANK[a] ? b : a), 'normal')
  const level = RANK[cls.level] > RANK[worstLevel] ? cls.level : worstLevel

  // 建议：合并去重，保持顺序
  const suggestions = [...new Set(groupResults.flatMap((r) => r.suggestions || []))]

  // 总结：取自最严重组，信息量更高
  const summary = groupResults.find((r) => r.level === worstLevel)?.summary || groupResults[0].summary

  return {
    ...groupResults[0],
    metrics,
    shapeType,
    level,
    redFlags: { suspectedSynostosis, signs },
    seeDoctor: cls.seeDoctor || groupResults.some((r) => r.seeDoctor),
    summary,
    suggestions,
    _groups: groupResults.length,
    _averaged: true
  }
}
