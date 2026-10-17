// 图片压缩并读取为 base64（返回**不带** data: 前缀的纯 base64）
//
// 平台差异：
// - App / 小程序：uni.compressImage + uni.getFileSystemManager().readFile
// - H5（浏览器）：以上两个 API 均不存在，必须用 canvas 重绘压缩（blob: URL -> base64）
//
// 用「能力检测」自动分流，避免依赖条件编译或平台常量。

const MAX_SIDE = 1024 // 压缩后最长边，兼顾识别精度与请求体积

// 是否可用原生压缩/读文件 API
function canUseNative() {
  return (
    typeof uni !== 'undefined' &&
    typeof uni.compressImage === 'function' &&
    typeof uni.getFileSystemManager === 'function'
  )
}

// ---- H5：canvas 压缩 ----
function compressH5(filePath, quality = 70) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('当前环境不支持图片处理'))
      return
    }
    const img = new Image()
    img.onload = () => {
      try {
        const w0 = img.naturalWidth || img.width
        const h0 = img.naturalHeight || img.height
        if (!w0 || !h0) {
          reject(new Error('图片尺寸异常'))
          return
        }
        const scale = Math.min(1, MAX_SIDE / Math.max(w0, h0))
        const w = Math.max(1, Math.round(w0 * scale))
        const h = Math.max(1, Math.round(h0 * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        const q = Math.min(1, Math.max(0.1, quality / 100))
        const dataUrl = canvas.toDataURL('image/jpeg', q)
        const idx = dataUrl.indexOf(',')
        resolve(idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl)
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('图片读取失败，请重新选择照片'))
    img.src = filePath
  })
}

// ---- App / 小程序：原生 API ----
function compressNative(filePath, quality = 70) {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src: filePath,
      quality,
      success: (cres) => {
        const temp = cres.tempFilePath
        uni.getFileSystemManager().readFile({
          filePath: temp,
          encoding: 'base64',
          success: (rres) => resolve(rres.data),
          fail: reject
        })
      },
      fail: reject
    })
  })
}

// 压缩单张图片并转为 base64 字符串
export async function compressAndRead(filePath, quality = 70) {
  // 优先原生方案（效果更好）；若原生失败（如某些环境下不支持），回退 H5 canvas
  if (canUseNative()) {
    try {
      return await compressNative(filePath, quality)
    } catch (e) {
      // 回退到 canvas 方案
    }
  }
  return compressH5(filePath, quality)
}

// 批量处理图片路径数组 -> [{base64}]
export async function compressAll(filePaths, quality = 70) {
  const out = []
  for (const p of filePaths) {
    out.push({ base64: await compressAndRead(p, quality) })
  }
  return out
}
