# 部署到局域网 Ubuntu（192.168.3.79）

## 一、准备火山引擎 TTS 凭证（5 分钟）

1. 打开 [火山引擎控制台](https://console.volcengine.com/)，注册/登录（用手机号即可，无需企业认证）
2. 左侧菜单：**语音技术 → 语音合成大模型（豆包语音 2.0 / Seed-TTS）**
3. 开通服务（按量付费 / 字数包；新用户一般有免费额度）
4. 进入 **应用管理 → 创建应用**，应用名随便填（例如 `homework-app`）
5. 创建完后，点进应用 → 滚动到底部「**服务接口认证信息**」，能看到两个关键值：
   - **App ID**（你的是 `1599031079`）
   - **Access Token**（长字符串，**不要泄漏**，泄漏了就回来点「重置 Token」）

   > **注意**：豆包语音合成 2.0 走的是 **v3 SSE 接口**（`/api/v3/tts/unidirectional/sse`），用 `X-Api-App-Id` + `X-Api-Access-Key` + `X-Api-Resource-Id` 鉴权，**已经不需要 cluster 了**。
   > proxy.js 里会根据你选的音色前缀自动路由 `X-Api-Resource-Id`：
   > - `saturn_*_tob` 角色扮演音色 → `volc.megatts.default`（声音复刻 2.0）
   > - `*_uranus_bigtts` 通用音色  → `volc.service_type.10029`（语音合成 2.0）
   > 如果将来火山改了 resource_id，可以在 `homework.service` 里打开注释的 `Environment=VOLC_RESOURCE_ID=...` 强制指定。
6. **音色详情**页会列出已授权的 Voice_type（截图里 99 条），例如：
   - `saturn_zh_female_keainvsheng_tob`（可爱女生 ⭐ 推荐小学生）
   - `saturn_zh_male_tiancaitongzhuo_tob`（天才同桌）
   - `zh_female_vv_uranus_bigtts`（vivi 2.0）
   - 以及其他角色扮演 / 通用场景音色

把这三个值记下来，下面配 `homework.service` 要用。

---

## 二、上传文件到 Ubuntu

本机执行（把路径改成你的 session 目录）：

```bash
# 在你的电脑上
scp proxy.js index.html homework.service \
    user@192.168.3.79:/tmp/homework/
```

> 如果 `/tmp/homework/` 不存在，先 `ssh user@192.168.3.79 mkdir -p /tmp/homework`

---

## 三、在 192.168.3.79 上安装（SSH 登进去后执行）

```bash
# 1) 装 Node.js 18+（官方源）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2) 创建专用用户 + 部署目录
sudo useradd -r -m -d /opt/homework -s /bin/bash homework
sudo mkdir -p /opt/homework

# 3) 把文件搬到部署目录
sudo cp /tmp/homework/proxy.js       /opt/homework/
sudo cp /tmp/homework/index.html     /opt/homework/
sudo cp /tmp/homework/homework.service /etc/systemd/system/
sudo chown -R homework:homework /opt/homework

# 4) 编辑 service 文件，填入你的火山 AppID/Token
sudo nano /etc/systemd/system/homework.service
#   修改两行即可：
#     Environment=VOLC_APPID=1599031079
#     Environment=VOLC_TOKEN=你的AccessToken
#   （resource_id 代码里按音色前缀自动路由，不用手动配）

# 5) 启用并启动
sudo systemctl daemon-reload
sudo systemctl enable --now homework

# 6) 看日志确认启动成功
sudo journalctl -u homework -n 30 --no-pager
#   期望看到:
#     🎓 小学生作业辅导 · 本地服务
#     监听 : 0.0.0.0:8787
#     TTS  : ✅ 火山 豆包语音合成 2.0 · 自动路由 (saturn_*→ICL / 其它→TTS)
```

---

## 四、开防火墙

```bash
# Ubuntu 默认 ufw
sudo ufw allow 8787/tcp
sudo ufw reload

# 如果用 firewalld：
# sudo firewall-cmd --permanent --add-port=8787/tcp && sudo firewall-cmd --reload
```

---

## 五、测试

在**同局域网的任意设备**（电脑、手机、iPad）浏览器打开：

```
http://192.168.3.79:8787/app
```

应该看到作业辅导 App 主界面。

- 健康检查：`http://192.168.3.79:8787/` — 会输出监听端口和 TTS 是否启用
- TTS 直测：`http://192.168.3.79:8787/tts?text=你好小朋友&voice=saturn_zh_female_keainvsheng_tob` — 浏览器会下载/播放一段 MP3

---

## 六、在 H5 App 里配置（打开 App 后一次性设置）

在 App 右上角点 **⚙️ → AI 设置**，填四项：

| 字段 | 值 |
|---|---|
| API 接入地址 | `http://192.168.3.79:8787/v1/chat/completions` |
| 模型名称 | `google/gemini-2.5-flash` *（或其他 OpenRouter 模型）* |
| API Key | 你的 OpenRouter Key `sk-or-v1-...` |
| **TTS 服务地址** | `http://192.168.3.79:8787/tts` |
| **TTS 音色** | 可爱女生（默认，saturn_zh_female_keainvsheng_tob） |

点 **🔊 试听语音** 能听到 AI 童声，说明全部通了。

---

## 七、更新 / 排错

**更新 index.html（孩子用的时候你又改了）**：

```bash
scp index.html user@192.168.3.79:/tmp/
ssh user@192.168.3.79 "sudo cp /tmp/index.html /opt/homework/ && sudo systemctl restart homework"
```

（浏览器 Ctrl+F5 强刷即可看到新版）

**看错误日志**：

```bash
sudo journalctl -u homework -f
```

**常见错误**：

| 症状 | 原因 | 解决 |
|---|---|---|
| TTS 试听报 "未配置火山引擎" | service 里没填 VOLC_APPID / VOLC_TOKEN | 改完 `sudo systemctl restart homework` |
| TTS 试听报 HTTP 401 / 鉴权失败 | Access Token 错、过期、或填到 AppID 上了 | 去火山控制台重新复制 Access Token |
| TTS 试听报 code `45000000` / 45xx | 该音色没在你的应用里授权 / 填错 voice / resource_id 没对上 | ① 控制台 → 应用 → 音色详情里对照 Voice_type 列复制；② 如果是 uranus_bigtts 音色报错，在 service 里加 `Environment=VOLC_RESOURCE_ID=volc.service_type.10029`；是 saturn 音色报错则用 `volc.megatts.default` |
| TTS 试听报 "火山 HTTP 404" | 端点路径打错 / 应用没开通 Seed-TTS 2.0 | 代码走的是 `/api/v3/tts/unidirectional/sse`；再去控制台确认应用已开通「豆包语音合成 2.0」 |
| TTS 试听报 "火山未返回音频数据" | SSE 解析异常 / 上游 session 提前结束 | 看 `journalctl -u homework` 里的原始 raw，把 logid 发给火山工单 |
| 手机打不开 `192.168.3.79` | 不在同一个 WiFi / 防火墙挡了 | `ping 192.168.3.79` 测连通 + `ufw status` |
| AI 识别报 401 | OpenRouter Key 不对 | 回设置页重填 |

---

## 八、以后想迁到小程序

`proxy.js` 里的 `/tts` 和 `/v1/chat/completions` 两个端点**原样复用**。在小程序里：

- 微信后台「开发设置 → 服务器域名」把 `http://192.168.3.79:8787` 加到 `request` 合法域名（注意：小程序正式版**要求 HTTPS + 备案**，真要上架得把这个服务搬到公网 + 加 SSL。开发阶段用"不校验域名"即可）
- 小程序里 `wx.request` 调 `/v1/chat/completions`、`wx.downloadFile` 或 `wx.request({responseType:'arraybuffer'})` 调 `/tts` 拿 MP3
- 音频用 `wx.createInnerAudioContext()` 播放

现在这套 H5 结构已经跟小程序的结构对齐，迁过去主要是改"传输层"和"渲染层"（WXML），业务逻辑（出题/闯关/TTS/存档）都能直接搬。
