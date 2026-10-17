// 硅基流动（SiliconFlow）API 调用封装：多图同传 + 主备模型兜底
import { DEFAULT_MODEL, BACKUP_MODEL } from '../config.js'
import { buildPrompt } from '../prompts/assessPrompt.js'

const SF_BASE = 'https://api.siliconflow.cn/v1/chat/completions'

// 将 uni.request 封装为 Promise（success/fail 回调风格，兼容各端）
function uniRequest(payload) {
  return new Promise((resolve, reject) => {
    uni.request({ ...payload, success: resolve, fail: reject })
  })
}

// 构造请求体（纯函数，便于测试）
export function buildPayload({ apiKey, model, content, maxTokens = 2048, temperature = 0.2 }) {
  return {
    url: SF_BASE,
    method: 'POST',
    header: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    data: {
      model,
      messages: [{ role: 'user', content }],
      temperature,
      max_tokens: maxTokens
    }
  }
}

// 从模型文本解析 JSON（容错：兼容 ```json 代码块与首尾噪声）
export function parseJSON(text) {
  if (!text) return null
  let s = String(text).trim()
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) s = fence[1].trim()
  try {
    return JSON.parse(s)
  } catch (e) {
    const start = s.indexOf('{')
    const end = s.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(s.slice(start, end + 1))
      } catch (_) {}
    }
    return null
  }
}

// 调用一次模型（依赖 unia.request，运行时由 uniapp 提供）
export async function callModel({ apiKey, model, content }) {
  const payload = buildPayload({ apiKey, model, content })
  const res = await uniRequest(payload)
  if (res && res.statusCode && res.statusCode >= 400) {
    // 尽量带上服务端返回的原因（如"模型不存在"/"Token 无效"），便于定位
    const detail =
      res?.data?.message ||
      res?.data?.error?.message ||
      res?.data?.msg ||
      res?.errMsg ||
      ''
    const hint = /model/i.test(detail) ? '（请检查设置页的模型名是否与硅基流动一致）' : ''
    throw new Error(`HTTP ${res.statusCode}${detail ? ' - ' + detail : ''}${hint}`)
  }
  const text = res?.data?.choices?.[0]?.message?.content
  return parseJSON(text)
}

// 头型评估：四图同传 + 主备模型兜底
export async function assessHead(images, apiKey, ageMonths) {
  const content = (images || []).map((im) => ({
    type: 'image_url',
    image_url: { url: `data:image/jpeg;base64,${im.base64}` }
  }))
  content.push({ type: 'text', text: buildPrompt(ageMonths) })

  const models = [DEFAULT_MODEL, BACKUP_MODEL]
  let lastErr
  for (const model of models) {
    try {
      const parsed = await callModel({ apiKey, model, content })
      if (parsed && parsed.views) return parsed
    } catch (e) {
      lastErr = e
    }
  }
  throw new Error('AI 调用失败，请检查 API Key 或网络后重试')
}
