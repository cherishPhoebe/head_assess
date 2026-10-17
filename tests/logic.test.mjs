import assert from 'node:assert'
import { calcTopMetrics } from '../src/utils/geometry.js'
import { classify, ciStatus, asymmetryStatus, flatnessStatus, earOffsetStatus } from '../src/utils/classify.js'
import { buildPayload, parseJSON } from '../src/utils/sfClient.js'
import { aggregateResults } from '../src/utils/aggregate.js'
import { generateAdvice } from '../src/utils/advice.js'
import { summarizeQuality } from '../src/utils/qualityCheck.js'

let passed = 0
function check(name, cond) {
  assert.ok(cond, name)
  passed++
  console.log('✓', name)
}

// ---- geometry ----
const m1 = calcTopMetrics({
  front: { x: 100, y: 0 }, back: { x: 100, y: 200 },
  left: { x: 0, y: 100 }, right: { x: 200, y: 100 }
})
check('CI 对称应为 100', Math.abs(m1.ci - 100) < 0.1)
check('asymmetry 对称应为 0', Math.abs(m1.asymmetry) < 0.1)

const m2 = calcTopMetrics({
  front: { x: 100, y: 0 }, back: { x: 100, y: 200 },
  left: { x: 0, y: 100 }, right: { x: 180, y: 100 }
})
check('CI 应为 90', Math.abs(m2.ci - 90) < 0.1)
check('asymmetry 应 > 5%', m2.asymmetry > 5)

const m3 = calcTopMetrics(null)
check('非法输入返回 null', m3 === null)

// ---- classify ----
const c1 = classify({
  metrics: { ci: 95, asymmetry: 2, sideFlatness: 0.2, earOffset: 1 },
  shapeType: 'brachy', ageMonths: 4, redFlags: {}
})
check('CI 95 -> ciStatus mild', c1.statuses.ci === 'mild')
check('整体 level mild', c1.level === 'mild')
check('4 月龄轻度 seeDoctor=false', c1.seeDoctor === false)

const c2 = classify({
  metrics: { ci: 83, asymmetry: 2 }, shapeType: 'normal',
  ageMonths: 4, redFlags: { suspectedSynostosis: true }
})
check('骨缝早闭红线 seeDoctor=true', c2.seeDoctor === true)

const c3 = classify({
  metrics: { ci: 83, asymmetry: 14 }, shapeType: 'plagio',
  ageMonths: 8, redFlags: {}
})
check('不对称 14% -> severe', c3.level === 'severe')
check('>6 月且重度 seeDoctor=true', c3.seeDoctor === true)

const c4 = classify({
  metrics: { ci: 83, asymmetry: 2, sideFlatness: 0.1, earOffset: 0.5 },
  shapeType: 'normal', ageMonths: 3, redFlags: {}
})
check('全正常 -> level normal', c4.level === 'normal')

// 状态函数边界
check('ciStatus 83 normal', ciStatus(83) === 'normal')
check('ciStatus 70 mild', ciStatus(70) === 'mild')
check('asymmetryStatus 10 moderate', asymmetryStatus(10) === 'moderate')
check('flatnessStatus 0.8 severe', flatnessStatus(0.8) === 'severe')
check('earOffsetStatus 12 severe', earOffsetStatus(12) === 'severe')

// ---- parseJSON 容错 ----
const p1 = parseJSON('```json\n{"a":1}\n```')
check('解析 ```json 围栏', p1 && p1.a === 1)
const p2 = parseJSON('好的 {"ci":83} 完成')
check('解析带噪声文本', p2 && p2.ci === 83)
const p3 = parseJSON('完全不是 json')
check('非法 JSON 返回 null', p3 === null)

// ---- buildPayload ----
const pl = buildPayload({ apiKey: 'sk-test', model: 'M', content: [{ type: 'text', text: 'hi' }] })
check('payload 指向 siliconflow', pl.url.includes('siliconflow'))
check('payload 带 Bearer', pl.header.Authorization === 'Bearer sk-test')
check('payload 携带 model', pl.data.model === 'M')

// ---- aggregate（多次拍摄取平均）----
const single = {
  metrics: { ci: 90, asymmetry: 6, sideFlatness: 0.4, earOffset: 4, obliqueSeverity: 0.2 },
  shapeType: 'brachy', level: 'mild', redFlags: { suspectedSynostosis: false, signs: [] },
  seeDoctor: false, summary: '单次', suggestions: ['建议A', '建议B']
}
const agg1 = aggregateResults([single], 4)
check('单组聚合保留原值', agg1.metrics.ci === 90 && agg1._groups === 1 && agg1._averaged === false)

const g2 = {
  metrics: { ci: 84, asymmetry: 4, sideFlatness: 0.3, earOffset: 3, obliqueSeverity: 0.1 },
  shapeType: 'brachy', level: 'normal', redFlags: { suspectedSynostosis: false, signs: [] },
  seeDoctor: false, summary: '第二次', suggestions: ['建议A', '建议C']
}
const agg2 = aggregateResults([single, g2], 4)
check('两组 CI 取平均 = 87', Math.abs(agg2.metrics.ci - 87) < 0.1)
check('两组不对称取平均 = 5', Math.abs(agg2.metrics.asymmetry - 5) < 0.1)
check('shapeType 多数 = brachy', agg2.shapeType === 'brachy')
check('两组 level 取最严重 = mild', agg2.level === 'mild')
check('建议去重合并 3 条', agg2.suggestions.length === 3)

// 红线 OR：任一组疑似 -> 最终疑似
const g3 = {
  metrics: { ci: 83, asymmetry: 2 }, shapeType: 'normal', level: 'normal',
  redFlags: { suspectedSynostosis: true, signs: ['前额歪斜'] }, seeDoctor: true, suggestions: []
}
const agg3 = aggregateResults([single, g3], 4)
check('红线取 OR：最终疑似', agg3.redFlags.suspectedSynostosis === true)
check('红线取 OR：最终 seeDoctor', agg3.seeDoctor === true)

// ---- advice（分程度 + AAP 参考）----
const a1 = generateAdvice({ level: 'mild', shapeType: 'plagio', ageMonths: 4, seeDoctor: false, redFlags: {} })
check('advice 含四类结构', a1.sleep.length && a1.tummy.length && a1.medical.length && a1.aapRef.length)
check('advice 含月龄解读', typeof a1.ageNote === 'string' && a1.ageNote.includes('4-6'))
check('轻度建议为居家观察', a1.medical.some(t => t.includes('居家')))

const a2 = generateAdvice({ level: 'moderate', shapeType: 'brachy', ageMonths: 8, seeDoctor: true, redFlags: { suspectedSynostosis: true, signs: ['骨嵴'] } })
check('红线建议指向神经外科', a2.medical.some(t => t.includes('神经外科')))
check('红线建议含征象', a2.medical.some(t => t.includes('骨嵴')))
check('红线时睡眠建议优先就医', a2.sleep[0].includes('就医'))

const a3 = generateAdvice({ level: 'normal', shapeType: 'normal', ageMonths: 2, seeDoctor: false, redFlags: {} })
check('正常建议含预防', a3.medical.some(t => t.includes('常规')))

// ---- summarizeQuality ----
const qcRaw = [
  { index: 0, ok: true, reason: '合格' },
  { index: 1, ok: false, reason: '光线不足', angle: true, lighting: false, occlusion: false, blur: false, coverage: true },
  { index: 2, ok: true, reason: '合格' },
  { index: 3, ok: true, reason: '合格' }
]
const sum = summarizeQuality(qcRaw, 4)
check('质检汇总识别 1 张失败', sum.failed.length === 1 && sum.failed[0].index === 1)
check('质检汇总 allOk=false', sum.allOk === false)
check('质检按 index 映射', sum.byIndex[1] && sum.byIndex[1].ok === false)

console.log(`\n全部 ${passed} 项检查通过 ✅`)
