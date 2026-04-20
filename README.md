# 学霸奇遇记 — 小学生作业辅导

基于 AI + 游戏化的小学作业辅导工具，支持 1-6 年级数学/语文/英语/科学（3年级起）四个学科。

## 功能特色

- **闯关答题** — 1-6 年级人教版题库 1100+ 题，按入门/进阶/挑战三级难度递增
- **拍照出题** — 拍照上传作业，AI 自动识别题目并生成闯关副本
- **蘑菇博士讲解** — 答错时 AI 逐步提示，提供完整解题思路
- **语音朗读** — 火山引擎豆包 TTS 真人级语音，点击🔊按钮朗读题目
- **战斗动画** — 能量弹射击、连击 Combo、Boss 反击等游戏化交互
- **错题库** — 服务端 SQLite 存储，多设备共享，支持错题闯关
- **宠物系统** — 🦜小鹦鹉→🐱机灵猫→🦊勇敢狐→🐲闪耀龙→🦅神兽凤凰
- **家长报告** — 可视化学习数据统计和建议

## 项目结构

```
├── index.html          # 主页面（HTML + CSS + JS 单文件应用）
├── proxy.js            # Node.js 代理服务（AI 转发 + TTS + 错题库 API + 静态托管）
├── questions.js        # 题库初始化 + 工具函数
├── grade1.js ~ grade6.js  # 各年级题库（人教版）
├── homework.service    # systemd 服务配置
├── deploy.sh           # 一键部署脚本
└── DEPLOY.md           # 火山引擎 TTS 配置详细说明
```

## 快速部署

### 环境要求

- **服务器**：Linux（Ubuntu/Debian 推荐），有 Node.js 18+
- **本机**：macOS/Linux/Windows，有 SSH 客户端
- **网络**：服务器和客户端在同一局域网

### 1. 首次安装

```bash
# 设置目标服务器（默认 192.168.3.79）
export HOST=192.168.3.79

# 首次安装（自动安装 Node.js、创建用户、部署文件、配置 systemd 服务）
./deploy.sh <你的SSH用户名> --install
```

脚本会自动完成：
- 检查/安装 Node.js 20
- 创建 `homework` 系统用户
- 上传所有文件到 `/opt/homework/`
- 安装 systemd 服务
- 开放 8787 端口（如有 ufw）

### 2. 配置火山引擎 TTS（可选但推荐）

> 不配置 TTS 也能使用，只是没有语音朗读功能

1. 注册 [火山引擎](https://console.volcengine.com/)
2. 开通 **语音技术 → 语音合成大模型**
3. 创建应用，获取 **AppID** 和 **Access Token**
4. 在服务器上编辑 service 文件填入凭证：

```bash
sudo nano /etc/systemd/system/homework.service
```

修改以下两行：
```ini
Environment=VOLC_APPID=你的AppID
Environment=VOLC_TOKEN=你的AccessToken
```

然后重启服务：
```bash
sudo systemctl daemon-reload
sudo systemctl restart homework
```

> 详细 TTS 配置说明见 [DEPLOY.md](DEPLOY.md)

### 3. 安装错题库依赖

错题库使用 SQLite 存储在服务端，需安装 `better-sqlite3`：

```bash
ssh <用户名>@<服务器IP>
cd /opt/homework
sudo npm install better-sqlite3
sudo systemctl restart homework
```

数据库文件自动创建在 `/opt/homework/wrongbook.db`。

### 4. 日常更新

修改代码后，一键更新部署：

```bash
# 普通更新（只覆盖 HTML + JS 文件，重启服务）
./deploy.sh <用户名>

# 连 systemd service 文件一起更新（自动保留已有 Token）
./deploy.sh <用户名> --service
```

也可以手动部署：

```bash
# 上传文件
scp index.html proxy.js questions.js grade*.js <用户名>@<IP>:/tmp/homework-deploy/

# 远程执行
ssh <用户名>@<IP>
sudo cp /tmp/homework-deploy/*.js /tmp/homework-deploy/index.html /opt/homework/
sudo chown homework:homework /opt/homework/*.js /opt/homework/index.html
sudo systemctl restart homework
```

### 5. 验证部署

```bash
# 健康检查
curl http://<服务器IP>:8787/

# 访问应用
# 浏览器打开 http://<服务器IP>:8787/app

# 查看日志
sudo journalctl -u homework -f
```

## 配置说明

### 环境变量（在 homework.service 中配置）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `8787` | 监听端口 |
| `BIND` | `0.0.0.0` | 监听地址 |
| `UPSTREAM` | `https://openrouter.ai/api/v1/chat/completions` | AI 聊天上游 |
| `VOLC_APPID` | (空) | 火山引擎 AppID，填了才启用 TTS |
| `VOLC_TOKEN` | (空) | 火山引擎 Access Token |
| `VOLC_RESOURCE_ID` | (空) | 留空自动使用 `seed-tts-2.0` |
| `STATIC_DIR` | 脚本所在目录 | 静态文件目录 |

### API 路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 健康检查 |
| `/app` | GET | 主页面 |
| `/v1/chat/completions` | POST | AI 聊天代理（转发到上游） |
| `/tts?text=...&voice=...` | GET/POST | 火山引擎 TTS 语音合成 |
| `/api/wrongbook?user=...` | GET | 获取错题列表 |
| `/api/wrongbook?user=...` | POST | 添加错题 |
| `/api/wrongbook/<id>?user=...` | DELETE | 删除单条错题 |
| `/api/wrongbook?user=...` | DELETE | 清空错题库 |
| `/static/<file>` | GET | 静态文件 |

### 前端默认配置

应用内置以下默认值（首次使用无需配置）：

- AI 接口：`https://openrouter.ai/api/v1/chat/completions`
- AI 模型：`openai/gpt-4o`
- TTS 地址：`http://192.168.3.79:8787/tts`
- TTS 音色：`saturn_zh_female_keainvsheng_tob`（可爱女生）

可在应用内 ⚙️ 设置页面修改。

## 题库说明

题库按人教版教材编排，存放在 `grade1.js` ~ `grade6.js` 中：

- 每年级包含数学、语文、英语三科（3年级起增加科学）
- 每题带 `lv` 字段标记难度：`1`=入门、`2`=进阶、`3`=挑战
- 关卡按难度筛选题目：入门关只出 lv1，进阶关出 lv1+2，挑战关出全部
- 计算类题目通过循环随机生成，每次刷新不重复

添加新题格式：
```javascript
QB[年级].math.push({
  q: '题目文字',
  type: 'choice',           // 'choice' 或 'input'
  options: shuffle(['A','B','C','D']),  // choice 类型必填
  answer: 'A',              // 正确答案
  hints: ['提示1','提示2','提示3'],
  explain: '一句话讲解',
  topic: '知识点名称',
  lv: 1                     // 1=入门 2=进阶 3=挑战
});
```

## 常见问题

**Q: TTS 不出声？**
检查火山引擎 AppID/Token 是否正确配置，服务是否已开通 Seed-TTS 2.0。

**Q: 拍照出题识别不准？**
建议将 AI 模型改为 `openai/gpt-4o`（而非 mini），视觉识别能力更强。

**Q: 错题库加载失败？**
确认已安装 `better-sqlite3`（`cd /opt/homework && sudo npm install better-sqlite3`）。

**Q: 手机上显示不正常？**
确保使用 `http://<IP>:8787/app` 访问（不要用 localhost），清除浏览器缓存后重试。
