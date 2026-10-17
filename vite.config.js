import { defineConfig } from 'vite'
import uniModule from '@dcloudio/vite-plugin-uni'

// 兼容 CJS/ESM 不同 interop：默认导出可能是函数，也可能包在 .default 上
const uni = uniModule.default || uniModule

export default defineConfig({
  plugins: [uni()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
