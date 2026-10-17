// 头型综合分类与分级（结合月龄、各维度指标、骨缝早闭红线）

import { THRESHOLDS } from '../config.js'

const RANK = { normal: 0, mild: 1, moderate: 2, severe: 3 }

export function band(value, normal, mild, moderate) {
  if (value === undefined || value === null || Number.isNaN(value)) return 'normal'
  if (value < normal) return 'normal'
  if (value < mild) return 'mild'
  if (value < moderate) return 'moderate'
  return 'severe'
}

// 头颅指数 CI：偏离正常区间越远越严重（偏离 8 以内轻度，8–14 中度，以上重度）
export function ciStatus(ci) {
  if (ci === undefined || ci === null || Number.isNaN(ci)) return 'normal'
  const { low, high } = THRESHOLDS.ci
  const dev = ci < low ? (low - ci) : ci > high ? (ci - high) : 0
  if (dev === 0) return 'normal'
  if (dev < 8) return 'mild'
  if (dev < 14) return 'moderate'
  return 'severe'
}

export function asymmetryStatus(a) {
  return band(a, THRESHOLDS.asymmetry.normal, THRESHOLDS.asymmetry.mild, THRESHOLDS.asymmetry.moderate)
}

export function flatnessStatus(f) {
  return band(f, THRESHOLDS.sideFlatness.normal, THRESHOLDS.sideFlatness.mild, THRESHOLDS.sideFlatness.moderate)
}

export function earOffsetStatus(e) {
  return band(e, THRESHOLDS.earOffset.normal, THRESHOLDS.earOffset.mild, THRESHOLDS.earOffset.moderate)
}

// 输入：{ metrics, shapeType, ageMonths, redFlags }
// 输出：{ statuses, level, seeDoctor }
export function classify(input = {}) {
  const { metrics = {}, shapeType = 'normal', ageMonths = 0, redFlags = {} } = input

  const statuses = {
    ci: ciStatus(metrics.ci),
    asymmetry: asymmetryStatus(metrics.asymmetry),
    sideFlatness: flatnessStatus(metrics.sideFlatness),
    earOffset: earOffsetStatus(metrics.earOffset)
  }

  // 综合 level 取各维度最严重者
  let level = 'normal'
  for (const k in statuses) {
    if (RANK[statuses[k]] > RANK[level]) level = statuses[k]
  }

  // 就医判定：骨缝早闭疑似 / 重度 / (中重度且 >6月)
  const age = Number(ageMonths) || 0
  const seeDoctor =
    !!redFlags?.suspectedSynostosis ||
    level === 'severe' ||
    (RANK[level] >= 2 && age > 6)

  return { statuses, level, seeDoctor, shapeType }
}
