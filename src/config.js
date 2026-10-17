// 全局配置：默认模型、阈值、月龄分段（不含真实 API Key）

// 硅基流动视觉模型（设置页可直接输入任意模型名）
export const DEFAULT_MODEL = 'Qwen/Qwen3-VL-32B-Instruct'
export const BACKUP_MODEL = 'Qwen/Qwen3-VL-8B-Instruct'

// 常用视觉模型快捷填充（仅作参考，可输入列表以外的任意模型 ID）
export const MODEL_PRESETS = [
  'Qwen/Qwen3-VL-32B-Instruct',
  'Qwen/Qwen3-VL-30B-A3B-Instruct',
  'Qwen/Qwen3-VL-8B-Instruct',
  'Qwen/Qwen2.5-VL-72B-Instruct'
]

// 本地存储键
export const STORAGE_KEY_APIKEY = 'sf_api_key'
export const STORAGE_KEY_MODEL = 'sf_model'
export const STORAGE_KEY_PRECISION = 'precision_mode'

// 头型指标阈值（参考临床常用区间，仅用于自测分级，需以医生面诊为准）
export const THRESHOLDS = {
  ci: { low: 76, high: 90 },                              // <76 长头；76-90 正常；>90 扁头
  asymmetry: { normal: 4, mild: 8, moderate: 12 },         // 颅顶不对称指数 %
  sideFlatness: { normal: 0.3, mild: 0.5, moderate: 0.7 }, // 侧视扁平度 0-1
  earOffset: { normal: 3, mild: 6, moderate: 10 }          // 正面耳位偏移 %
}

// 月龄分段（仅用于解读提示，非诊断）
export const AGE_BANDS = [
  { max: 3, label: '0-3 月' },
  { max: 6, label: '4-6 月' },
  { max: 12, label: '7-12 月' },
  { max: 999, label: '1 岁以上' }
]

export function ageBand(ageMonths) {
  const v = Number(ageMonths)
  if (!Number.isFinite(v) || v < 0) return '未知'
  return (AGE_BANDS.find(b => v < b.max) || AGE_BANDS[AGE_BANDS.length - 1]).label
}
