# 宝宝头型评估 uniapp 应用

个人自用 · 拍照（四视图）AI 头型评估 · 直连硅基流动 API · 无服务器

> 完整规划见同级文档 `宝宝头型评估uniapp实现规划.md`

## 技术栈
- 前端：uniapp（Vue3），可打包 Android App / H5
- AI：硅基流动 SiliconFlow（OpenAI 兼容接口），默认 `Qwen/Qwen2.5-VL-72B-Instruct`，含 7B 备援模型
- 后端：无（前端直连 API，图片本地不落盘）

## 目录结构
```
baby-head-assess-uniapp/
├── index.html                # H5 入口（引用 /src/main.js）
├── vite.config.js            # vite + @dcloudio/vite-plugin-uni 配置
├── src/                      # 全部源码（uni CLI 要求放在 src/）
│   ├── main.js / App.vue / uni.scss
│   ├── manifest.json / pages.json
│   ├── config.js             # 默认模型、阈值、月龄分段、存储键（不含 Key）
│   ├── prompts/assessPrompt.js   # 四视图评估 Prompt（含月龄/分类/红线）
│   ├── utils/                # geometry / classify / sfClient / imageCompress
│   │                        #   qualityCheck / aggregate / advice / store
│   ├── components/           # 可复用 UI 组件
│   └── pages/                # 首页 / 拍摄 / 结果 / 指南
└── tests/logic.test.mjs      # 核心逻辑 Node 单测
```

> 注意：uniapp 的 vite CLI **要求源码放在 `src/` 目录**（它会去读 `src/manifest.json`）。
> 不要把它们移回根目录，否则会报 `ENOENT: src/manifest.json`。

## 运行方式
1. 用 **HBuilderX** 打开本目录（或 `npm install` 后用 CLI `npm run dev:h5`）。
2. 在「设置」页填入**硅基流动 API Key**（仅存本机，不写代码），并可切换主/备模型、开启高精度模式。
3. 首页录入宝宝月龄 → 拍摄四视图（俯视/侧视/正面/45°斜位）→ 开始分析 → 查看结果。

## 依赖版本说明（排错）
之前 `npm i` 报 `ETARGET No matching version found for @dcloudio/uni-app@^2.0.2` 的根因：
本项目用 **Vue3**，必须用 dcloud 的 **`3.0.0` 线**（vue3）依赖；原先写的 `^2.0.2` 是 vue2 线，且 dcloud 版本号带日期后缀（如 `3.0.0-5020620260917001`），`^2.0.2` 这种写法不会匹配带后缀的预发布版本。
现已将 `package.json` 改为对齐的 vue3 线固定版本，并补了 `vite.config.js`、H5 入口 `index.html`：

| 包 | 版本 |
|----|------|
| @dcloudio/uni-app | 3.0.0-5020620260917001 |
| @dcloudio/uni-components | 3.0.0-5020620260917001 |
| @dcloudio/uni-h5 | 3.0.0-5020620260917001 |
| @dcloudio/uni-app-plus | 3.0.0-5020620260917001 |
| @dcloudio/uni-cli-shared | 3.0.0-5020620260917001 |
| @dcloudio/vite-plugin-uni | 3.0.0-5020620260917001 |
| @dcloudio/types | ^3.0.15 |
| vue | 3.4.21 |
| vite | 5.2.8 |

> 若日后安装仍报版本相关错误，说明 dcloud 已发布更新的日期后缀版本，把上述 `50206…` 统一替换为 `npm view @dcloudio/uni-app version` 查到的最新 vue3 线版本即可（全部 @dcloudio 包保持同一后缀）。
> 更简单的方式：直接用 **HBuilderX** 打开本目录运行/打包，HBuilderX 自带编译器，无需 `npm install`。

## 配置 Key
- 获取：硅基流动控制台 → API Key
- 位置：应用内「设置」页填写并保存（写入 `uni.setStorage`）
- 高精度模式：设置页开关。开启后拍摄两组照片自动取平均，结果更稳健（默认开）。

## 可靠性增强（阶段 B · 已实现）
- **拍摄质量 AI 校验**：分析前自动对四张照片做质量审核（视角/光线/遮挡/模糊/占比/居中），不合格弹窗提醒可重拍；也可点「检查照片质量」手动触发。用轻量备模型校验以省成本，校验失败不阻塞评估。
- **多次拍摄取平均**：开启高精度模式后，可拍两组四视图，`aggregate.js` 对几何指标取平均、level 取最严重、骨缝早闭红线取 OR、shapeType 取多数、建议去重合并，结果页标注「已对 N 组取平均」。
- **主备模型兜底**：已在 `sfClient.js` 实现，主模型失败自动切 7B 备模型。

## 呈现与专业度增强（阶段 C · 已实现）
- **头型轮廓对比可视化**：正常参考轮廓（虚线）与实估轮廓（按 CI 变形、按不对称指数横向偏移）叠加对照，并标注 CI 与不对称值。
- **分程度定制建议库**：`advice.js` 按 level / shapeType / 月龄 / 红线生成结构化建议（睡眠体位 / 清醒趴卧 / 就医随访），并附 AAP 体位性斜头指南要点。
- **月龄分段解读**：结果按 0-3 / 4-6 / 7-12 / 1 岁以上分层解读头型意义。

## 测试
```bash
node tests/logic.test.mjs   # 验证几何/分类/解析/请求体/聚合/建议/质检，41 项
```

## 构建验证（已通过）
- `npm run dev:h5` 已成功启动（`ready`，http://localhost:5173/ 返回 200）。
- `npm run build:h5` 已成功产出 `dist/build/h5/`（含各页面 chunk）。
- `npm run build:app` 已成功产出 `dist/build/app/`。

## 打包 APK（App 平台）
uniapp 采用「每平台一个包」的依赖设计：
- `-p h5` → 需要 `@dcloudio/uni-h5`
- `-p app` → 需要 **`@dcloudio/uni-app-plus`**（缺失时会报
  `"isInSSRComponentSetup" is not exported by vue` 这类打包错，而非真正的 vue 版本问题）

流程：
1. `npm run build:app` 产出 `dist/build/app/`
2. HBuilderX → 打开/导入 `dist/build/app` → 发行 → 原生 App 云打包（APK）

> `vue` 已显式声明为直接依赖并锁定 `3.4.21`（与该版本 dcloud 内部 `@vue/*` 依赖对齐），
> 避免 npm 自动解析到不兼容版本。

## esbuild 平台二进制（重要）
若启动时报：
```
The package "@esbuild/win32-x64" could not be found, and is needed by esbuild.
```
说明 esbuild 的平台二进制没装上。本项目已在 `package.json` 的 `optionalDependencies` 中
**显式声明** `"@esbuild/win32-x64": "0.20.2"`，因此 `npm i` 会自动安装，无需手动处理。

> 说明：不要再用 `npm install @esbuild/win32-x64 --no-save` 临时补装——
> 它不写入 `package.json`，后续 `npm i` 会把它当作多余包**剪掉**，问题会复现。
>
> 若你的机器不在 Windows x64（如 Mac/ARM），把该条改成对应平台包即可
> （如 `@esbuild/darwin-arm64`），版本需与 `esbuild` 主版本一致（当前 `0.20.2`）。

## 注意
- 仅个人自用；如需公开分发，请改回云函数代理以保护 Key。
- 全链路「非诊断」声明；重度/红线结果引导就医（尤其疑似骨缝早闭时建议小儿神经外科）。
