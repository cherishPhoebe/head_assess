// 拍摄质量校验：调用模型逐张判断照片是否合格（视角/光线/遮挡/模糊/占比/居中）
// 复用 sfClient 的 callModel（含主备兜底），校验失败不阻塞主评估流程
import { callModel, parseJSON } from './sfClient.js'
import { DEFAULT_MODEL, BACKUP_MODEL } from '../config.js'

// variantNames：与传入 images 顺序对应的期望视角名，帮助模型判断视角是否正确
// 例如 ['top','side','front','oblique']
export async function checkQuality(images, apiKey, variantNames = [], model) {
  if (!images || !images.length) return []
  const models = model ? [model] : [DEFAULT_MODEL, BACKUP_MODEL]

  const content = images.map((im) => ({
    type: 'image_url',
    image_url: { url: `data:image/jpeg;base64,${im.base64}` }
  }))

  const expects = images
    .map((_, i) => `图${i + 1} 期望视角：${variantNames[i] || '未知'}`)
    .join('\n')

  const prompt = `你是头型评估照片质量审核员。请逐张判断以下婴儿头部照片是否适合用于头型评估。
对每张图（index 从 0 开始）检查五项：
- angle：视角是否正确（需匹配其期望视角：俯视=从正上方垂直看头顶；侧视=正侧面；正面=正前方；斜位≈45°半侧面）
- lighting：光线是否充足、均匀，无强阴影遮挡头部轮廓
- occlusion：是否有遮挡（帽子/发带/手/玩具遮住头部或面部）
- blur：是否模糊（运动模糊或失焦）
- coverage：头部是否占画面主要部分且基本居中
仅返回 JSON，不要其它文字：
{"results":[{"index":0,"ok":true,"angle":true,"lighting":true,"occlusion":false,"blur":false,"coverage":true,"reason":"合格"},{"index":1,"ok":false,"angle":false,"lighting":true,"occlusion":false,"blur":false,"coverage":true,"reason":"视角偏斜，非正上方俯视"}]}
${expects}`

  let lastErr
  for (const m of models) {
    try {
      const parsed = await callModel({ apiKey, model: m, content })
      const results = parsed?.results
      if (Array.isArray(results) && results.length) return results
      // 解析兜底：个别模型可能直接返回结果数组
      if (Array.isArray(parsed)) return parsed
    } catch (e) {
      lastErr = e
    }
  }
  return [] // 质量校验失败不阻塞主评估流程
}

// 将 checkQuality 返回的结果按 index 规整为 { ok, reason, items } 形式便于 UI 使用
export function summarizeQuality(qcResults, count) {
  const map = {}
  ;(qcResults || []).forEach((r) => {
    if (r && typeof r.index === 'number') {
      map[r.index] = {
        ok: !!r.ok,
        reason: r.reason || (r.ok ? '合格' : '质量不佳'),
        detail: {
          angle: r.angle,
          lighting: r.lighting,
          occlusion: r.occlusion,
          blur: r.blur,
          coverage: r.coverage
        }
      }
    }
  })
  const failed = []
  for (let i = 0; i < count; i++) {
    const q = map[i]
    if (!q || !q.ok) failed.push({ index: i, reason: q ? q.reason : '未校验' })
  }
  return { byIndex: map, failed, allOk: failed.length === 0 }
}
