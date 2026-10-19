// 图片压缩并读取为 base64（返回**不带** data: 前缀的纯 base64）
//
// 平台分流（用能力检测，不依赖条件编译）：
// - App（5+ 引擎）：plus.io 读取最稳，兼容 file://、_doc、相册临时路径等；可选 uni.compressImage 压缩
// - 小程序：uni.compressImage + uni.getFileSystemManager().readFile
// - H5（浏览器）：canvas 重绘压缩
//
// 之前的问题：App 上用 getFileSystemManager().readFile 读 chooseImage 返回的路径经常读不到，
// 失败后回退到 H5 的 canvas（App 内没有 document）必然报错「当前环境不支持图片处理」。

const MAX_SIDE = 1024 // 压缩后最长边，兼顾识别精度与请求体积

// 是否 App（5+ 引擎）
function isApp() {
  return typeof plus !== 'undefined' && plus.io
}

// ---- App：plus.io 读取文件为 base64（最稳）----
function readFilePlus(filePath) {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      filePath,
      (entry) => {
        entry.file(
          (file) => {
            const reader = new plus.io.FileReader()
            reader.onloadend = (e) => {
              const result = (e && e.target && e.target.result) || ''
              const idx = result.indexOf(',')
              resolve(idx >= 0 ? result.slice(idx + 1) : result)
            }
            reader.onerror = () => reject(new Error('读取文件失败'))
            reader.readAsDataURL(file)
          },
          (err) => reject(err)
        )
      },
      (err) => reject(err)
    )
  })
}

// App：先尝试压缩，失败则用原图；返回可读路径
function prepareAppPath(filePath, quality = 70) {
  return new Promise((resolve) => {
    if (typeof uni !== 'undefined' && typeof uni.compressImage === 'function') {
      uni.compressImage({
        src: filePath,
        quality,
        success: (cres) => resolve((cres && cres.tempFilePath) || filePath),
        fail: () => resolve(filePath)
      })
    } else {
      resolve(filePath)
    }
  })
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

// ---- 小程序：原生 API ----
function compressMini(filePath, quality = 70) {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src: filePath,
      quality,
      success: (cres) => {
        uni.getFileSystemManager().readFile({
          filePath: cres.tempFilePath,
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
  // 1) App：plus.io 读取（最可靠），压缩仅作体积优化，失败不影响读取
  if (isApp()) {
    try {
      const path = await prepareAppPath(filePath, quality)
      return await readFilePlus(path)
    } catch (e) {
      // 仍失败再尝试原生 API 兜底一次
      try {
        const data = await new Promise((resolve, reject) => {
          uni.compressImage({
            src: filePath,
            quality,
            success: (cres) => {
              uni.getFileSystemManager().readFile({
                filePath: cres.tempFilePath,
                encoding: 'base64',
                success: (r) => resolve(r.data),
                fail: reject
              })
            },
            fail: reject
          })
        })
        return data
      } catch (e2) {
        throw new Error('图片读取失败，请重试或更换照片')
      }
    }
  }

  // 2) 小程序：原生 API
  if (typeof uni !== 'undefined' && typeof uni.getFileSystemManager === 'function') {
    try {
      return await compressMini(filePath, quality)
    } catch (e) {
      // 落到 H5 兜底
    }
  }

  // 3) H5：canvas
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
