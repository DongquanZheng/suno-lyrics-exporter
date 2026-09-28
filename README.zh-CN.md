# Suno Lyrics Exporter

[English](README.md) | 简体中文

> 在 Suno 歌曲页面一键检查、预览并导出同步歌词。

Suno Lyrics Exporter 是一个面向 Chrome / Microsoft Edge 的 Manifest V3 浏览器扩展。安装后，Suno 歌曲页面右下角会自动出现 **♪ Export Lyrics** 按钮，无需打开开发者工具、复制歌曲 ID 或手动调用 API。

支持导出 **SRT、LRC、WebVTT 和 JSON**，也可以直接下载歌曲封面图片。

> [!IMPORTANT]
> 本项目是非官方工具，与 Suno 没有关联或合作关系。它依赖 Suno 当前的非公开接口，网站更新后可能需要同步调整。

## 功能

- 自动识别 `/song/<id>` 和 `/edit/<id>` 页面中的歌曲 ID
- 支持 Suno SPA 动态切歌，无需刷新扩展
- 对比原始歌词与实际同步歌词，显示完整性结果
- 列出无法可靠匹配的原歌词行，下载前即可发现缺失
- 支持 **Original Lyrics** 和 **Sung Lyrics** 两种字幕源
- 支持中文、英文、日文及混合歌词
- 处理标点、重复副歌、少词、多词和轻微改唱
- 默认过滤 Verse、Chorus 等段落标签及常见编曲提示
- 可调整字幕开始偏移，并自动避免相邻字幕重叠
- 下载 UTF-8 编码的 SRT、LRC、WebVTT 或 JSON
- 一键复制字幕文本
- 直接下载 Suno 高清歌曲封面
- 提供前五条字幕预览和完整预览
- 提供 Diagnostics、原始 JSON 下载和错误详情
- 使用 Shadow DOM 隔离样式，不污染 Suno 页面
- 自动记住格式、偏移、字幕源、面板位置等设置

## 安装

目前使用开发者模式安装。需要 [Node.js](https://nodejs.org/) 20 或更高版本。

```bash
git clone https://github.com/DongquanZheng/suno-lyrics-exporter.git
cd suno-lyrics-exporter
npm install
npm run build
```

构建完成后会生成 `dist/`。

### Microsoft Edge

1. 打开 `edge://extensions`
2. 开启“开发人员模式”
3. 点击“加载解压缩的扩展”
4. 选择项目中的 `dist` 文件夹

### Google Chrome

1. 打开 `chrome://extensions`
2. 开启“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择项目中的 `dist` 文件夹

## 使用

1. 在浏览器中登录 [Suno](https://suno.com/)
2. 打开任意歌曲页面：`https://suno.com/song/<song-id>`
3. 点击页面右下角的 **♪ Export Lyrics**
4. 检查歌词匹配数量和字幕预览
5. 选择字幕来源、格式和时间偏移
6. 点击 **Download SRT** 或 **Copy**

切换到另一首歌曲时，面板会自动加载新歌曲的数据。

### 字幕来源

| 模式 | 说明 |
| --- | --- |
| Original | 以创作时输入的完整歌词为文本，使用 Suno 的同步时间进行单调对齐。默认选项。 |
| Sung | 完全采用 Suno 返回的实际同步文本，适合歌曲存在改唱或漏唱的情况。 |

### 完整性状态

```text
✓ 42 / 42 lines matched
```

表示所有原歌词行均找到可靠的同步行。

```text
⚠ 39 / 42 lines matched
```

表示有 3 行未能可靠匹配。扩展会列出对应内容，但不会阻止下载。

## Diagnostics

面板底部的 **Diagnostics** 用于排查 Suno 接口或同步数据问题，其中包括：

- Song ID
- Metadata 加载状态
- 原歌词行数
- aligned word 数量
- 匹配行数
- 当前 endpoint
- 扩展版本
- 技术错误详情

点击 **Download raw JSON** 可以保存当前歌曲的原始 metadata 和 aligned lyrics。文件不包含 Suno 登录 token。

## 开发

```bash
npm install
npm run dev        # 监听源码并持续重建 dist/
npm test           # 运行自动化测试
npm run typecheck  # TypeScript 类型检查
npm run check      # 类型检查、测试、构建和 dist 验证
```

无需 Suno 登录的歌词对齐测试页面：

```bash
npm run harness
```

然后打开 <http://127.0.0.1:4173>。

Harness 使用明确的本地测试数据，只验证对齐、完整性和导出逻辑，不会伪装成实时 Suno API 测试。

## 项目结构

```text
public/
  manifest.json          Manifest V3 配置
src/
  alignment/             多语言歌词相似度与单调对齐
  background/            受限 API 代理与封面下载
  content/               页面注入和 SPA 路由监听
  export/                SRT / LRC / WebVTT / JSON
  lyrics/                字幕时间处理
  popup/                 浏览器工具栏入口
  suno/                  Suno 数据适配层
  ui/                    Shadow DOM 浮动面板
  utils/                 文本、文件名和设置工具
tests/                   自动化测试
harness/                 无登录浏览器测试页面
scripts/                 构建与产物验证脚本
```

Suno API、UI、歌词对齐和导出逻辑相互独立。如果 Suno 改变接口，通常只需修改 `src/suno/` 和后台请求白名单。

## 权限与隐私

扩展只申请以下权限：

| 权限 | 用途 |
| --- | --- |
| `storage` | 在本地保存格式、偏移、字幕源和面板位置 |
| `activeTab` | 从浏览器工具栏打开当前 Suno 页面的面板 |
| `downloads` | 将歌曲封面直接保存为本地文件 |

Host 权限仅限：

```text
https://suno.com/*
https://studio-api.prod.suno.com/*
```

项目没有分析统计、广告或外部后台。Suno session token 只在内存中用于当前 API 请求，不会写入存储或诊断文件。

## 已知限制

- Suno 返回的同步时间可能本身不准确，尤其是编辑过歌词的歌曲
- 整行时间完全错误时，仅凭 aligned lyrics 无法推断真实演唱位置
- 一行歌词中出现很长的演唱停顿不一定是数据错误，因此扩展不会自动压缩 token 间隔
- Suno 未返回的歌词行会被标记为缺失，但不会被凭空生成时间
- 编曲指令过滤采用保守规则，Diagnostics 可用于确认边界情况
- 当前不包含本地音频识别或逐行手动校时器

## 发布

1. 同步更新 `package.json`、`public/manifest.json` 和 `scripts/build.mjs` 中的版本号
2. 执行 `npm ci && npm run check`
3. 在 Edge 和 Chrome 中分别进行真实歌曲冒烟测试
4. 将 `dist/` 内的文件打包为 ZIP，而不是把 `dist` 目录本身作为 ZIP 根目录
5. 上传至 Chrome Web Store 或 Microsoft Edge Add-ons

## 致谢

本项目受到 [cityedge/suno_srt_downloader](https://github.com/cityedge/suno_srt_downloader) 启发，参考了其已验证的 aligned lyrics endpoint 和字幕时间处理思路。

参考项目采用 MIT License。本项目不是对其源码的机械复制，而是重新实现的 TypeScript / Manifest V3 扩展。第三方说明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## License

[MIT](LICENSE) © 2026 Suno Lyrics Exporter contributors
