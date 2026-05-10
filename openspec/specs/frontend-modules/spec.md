# frontend-modules Specification

## Purpose
TBD - created by archiving change migrate-bank-to-sqlite-and-pluggable-engines. Update Purpose after archive.
## Requirements
### Requirement: 前端目录结构与模块职责

系统 SHALL 在 `static/app/` 下按以下结构拆分前端代码，每个模块只承担其声明职责：

```
static/app/
├── main.js              # 应用入口，启动流程，视图路由
├── data.js              # 后端 API 封装（pick/coverage/curriculum/wrongbook 等）
├── ui.js                # 共享 UI 组件（toast / showConfirm / 设置弹窗）
├── tts.js               # TTS 预加载缓存与播放
├── pets.js              # 宠物系统（升级 / 装饰 / 动画）
├── ai.js                # AI 讲解 / 拍照出题 客户端
└── engines/
    ├── base.js
    ├── battle.js
    ├── shooting.js
    └── fighting.js
```

模块 MUST 使用 ES Module 语法（`import` / `export`）；MUST NOT 引入打包工具（webpack/vite/rollup）。

#### Scenario: 浏览器原生加载 ESM

- **WHEN** 浏览器加载 `index.html` 中的 `<script type="module" src="/static/app/main.js">`
- **THEN** 所有依赖通过原生 `import` 解析；服务器无需转译；`Network` 面板能看到各 `.js` 文件单独请求

#### Scenario: 模块职责边界

- **WHEN** 任何引擎模块（`engines/*.js`）尝试直接调用 `fetch('/api/wrongbook')`
- **THEN** 视为违反约定；正确做法是通过 `callbacks` 注入或调用 `data.js` 暴露的函数

### Requirement: index.html 仅保留骨架与 CSS

`index.html` SHALL 仅包含 HTML 结构、`<style>` 块、与 `<script type="module" src="/static/app/main.js">`。MUST NOT 内嵌大段业务 JS；MUST NOT 引入 `grade*.js` / `questions.js` / `curriculum.js` 旧脚本标签。

#### Scenario: 旧脚本标签已删除

- **WHEN** 重构完成后查看 `index.html`
- **THEN** 文件中不存在 `<script src="/static/grade1.js">` 等任何旧脚本引用

#### Scenario: 单 module 入口

- **WHEN** `index.html` 中 `<script>` 标签
- **THEN** 仅有一个 `type="module"` 的入口指向 `static/app/main.js`，无其他业务 `<script>` 块

### Requirement: data.js 封装所有后端调用

`static/app/data.js` SHALL 封装所有 HTTP 调用，对外暴露 Promise 接口。其他模块 MUST NOT 直接 `fetch` 后端 API（仅 TTS 二进制流的低层处理可在 `tts.js` 内）。

`data.js` MUST 至少导出：
- `fetchPick({grade, subject, lv?, topic?, count, source, user, ...})`
- `fetchCoverage()`
- `fetchCurriculum({grade?, subject?})`
- `addQuestion(payload)`
- `wrongbookList(user)`、`wrongbookAdd(user, payload)`、`wrongbookDelete(user, id)`、`wrongbookClear(user)`

#### Scenario: 封装的接口可被引擎使用

- **WHEN** `BattleEngine` 中需要把错题写入数据库
- **THEN** 它通过 `callbacks.onWrongAdd`，最终由 `main.js` 调用 `data.wrongbookAdd`，引擎自身不直接 `fetch`

#### Scenario: 错误透明上抛

- **WHEN** `data.fetchPick` 收到 4xx / 5xx 响应
- **THEN** Promise reject 一个含 `status` 与 `message` 的 Error 对象，调用方决定 UI 反馈

### Requirement: 旧 JS 题库归档

迁移完成后系统 SHALL 把 `grade1.js` ~ `grade6.js` / `questions.js` / `curriculum.js` 移动到 `legacy/` 目录，作为历史备份；MUST NOT 在线上继续被前端加载或后端 require。

#### Scenario: 文件已归档

- **WHEN** 部署完成后检查仓库
- **THEN** `legacy/` 目录存在并含有这些文件副本；项目根目录已无这些文件

#### Scenario: legacy 不被引用

- **WHEN** grep `legacy/grade1.js` 等路径
- **THEN** 除 `legacy/README.md` 说明文件外，仓库内其他代码不应引用此目录中的文件

