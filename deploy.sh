#!/usr/bin/env bash
# ============================================================
#  deploy.sh — 一键部署/更新 "小学生作业辅导" 到远端服务器
#
#  用法：
#    ./deploy.sh                         # 普通更新（覆盖代码 + db migrate + 重启）
#    ./deploy.sh ubuntu                  # 指定 SSH 用户名
#    ./deploy.sh ubuntu --service        # 连 systemd unit 一起覆盖（自动保留 Token）
#    ./deploy.sh ubuntu --install        # 首次安装（装 Node / 建用户 / 装 service）
#    ./deploy.sh --check                 # 只跑健康检查（不部署）
#    ./deploy.sh --no-seed               # 跳过 db:seed（数据库种子已存在时）
#    SSH_USER=ubuntu ./deploy.sh         # 环境变量形式
#    SSH_PASS=xxx ./deploy.sh            # 密码登录（不写入脚本）
#    HOST=10.0.0.5 ./deploy.sh ubuntu    # 临时改目标 IP
#
#  默认目标：111.229.191.225（腾讯云 Ubuntu）
#  依赖：本机有 ssh / scp（密码登录还需 sshpass）
#
# ============================================================
#  线上环境速查（仅非敏感信息；密码 / Token / 私钥不要写这里！）
# ------------------------------------------------------------
#  服务器
#    云厂商    : 腾讯云 · 轻量应用服务器
#    公网 IP   : 111.229.191.225
#    系统      : Ubuntu 24.04.4 LTS  (4C / 4G / 3M 带宽 / 40G SSD)
#    SSH 用户  : ubuntu      （SSH 密码见 Obsidian 笔记，不入仓）
#    Node      : v20.20.2
#
#  部署
#    部署目录  : /opt/homework/
#    应用属主  : homework:homework  （由 service 模式创建；update 模式不动）
#    服务名    : systemd `homework.service`
#    监听端口  : 8787  （腾讯云防火墙已放行）
#    日志      : sudo journalctl -u homework -f
#    AI 上游   : https://openrouter.ai/api/v1/chat/completions
#    TTS       : 火山 豆包语音合成 2.0 (Seed-TTS 2.0)，Token 在 service 里
#                （AppID 1599031079；resource_id 按 voice 前缀自动路由）
#
#  对外端点
#    H5 入口   : https://taobinxian.cloud/app
#                http://111.229.191.225:8787/app   （回退）
#    健康检查  : https://taobinxian.cloud/
#    AI 代理   : https://taobinxian.cloud/v1/chat/completions
#    TTS 接口  : https://taobinxian.cloud/tts
#    域名      : taobinxian.cloud  (帝思普注册，DNSPod 解析 @ + www
#                → 111.229.191.225；2027-04-20 到期；HTTPS 已配)
#
#  推荐运维命令（本机执行；密码用 SSH_PASS 一次性环境变量传，禁止写脚本）
#    SSH_PASS='<从笔记读取>' bash deploy.sh ubuntu              # 标准更新
#    SSH_PASS='<从笔记读取>' bash deploy.sh ubuntu --no-seed    # 跳过 seed
#    bash deploy.sh --check                                       # 无副作用健康检查
#
#  线上验证（部署后跑一遍）
#    curl -sI https://taobinxian.cloud/static/app/main.js \
#      | grep -iE '^(cache-control|etag):'
#      # 期望: Cache-Control: public, max-age=300, must-revalidate
#      #       ETag: W/"..."
#    ETAG=$(curl -sI https://taobinxian.cloud/static/app/main.js \
#      | awk -F': *' 'tolower($1)=="etag"{print $2}' | tr -d '\r\n')
#    curl -sI -H "If-None-Match: $ETAG" \
#      https://taobinxian.cloud/static/app/main.js | head -1
#      # 期望: HTTP/1.1 304 Not Modified
#    curl -s https://taobinxian.cloud/app \
#      | grep -cE 'modulepreload|data-skeleton|prefers-reduced-motion|sk-bar'
#      # 期望: ≥ 16
#
#  应急回滚
#    A) 本地版本回退后重部署：
#         git checkout <旧 commit> -- index.html proxy.js static/ lib/ test/
#         SSH_PASS='<...>' bash deploy.sh ubuntu --no-seed
#         git checkout HEAD -- .
#    B) 单文件应急覆盖：
#         SSH_PASS='<...>' sshpass -p "$SSH_PASS" scp <文件> \
#           ubuntu@111.229.191.225:/tmp/
#         SSH_PASS='<...>' sshpass -p "$SSH_PASS" ssh \
#           ubuntu@111.229.191.225 \
#           "sudo cp /tmp/<文件> /opt/homework/ && sudo systemctl restart homework"
#
#  ❗ 严禁在本文件写入：SSH 密码 / VOLC_TOKEN / OpenRouter Key / 任何私钥。
#     这些信息只存：① Obsidian 笔记  ② 服务器上的 /etc/systemd/system/homework.service
# ============================================================

set -euo pipefail

# ---------- 默认配置（可通过环境变量 / 位置参数覆盖） ----------
HOST="${HOST:-111.229.191.225}"
SSH_PORT="${SSH_PORT:-22}"
# 域名（用于健康检查 / 输出）；若公网域名生效会优先用 HTTPS 域名探测
DOMAIN="${DOMAIN:-taobinxian.cloud}"
DEFAULT_USER="ubuntu"
REMOTE_USER="${SSH_USER:-}"
SSH_PASS="${SSH_PASS:-}"
MODE="update"
SKIP_SEED=0
CHECK_ONLY=0

# ---------- 参数解析 ----------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --install)  MODE="install"; shift ;;
    --service)  MODE="service"; shift ;;
    --check)    CHECK_ONLY=1; shift ;;
    --no-seed)  SKIP_SEED=1; shift ;;
    --host=*)   HOST="${1#*=}"; shift ;;
    --port=*)   SSH_PORT="${1#*=}"; shift ;;
    -h|--help)
      sed -n '2,18p' "$0" | sed 's/^#//'
      exit 0 ;;
    -*)
      echo "❌ 未知参数: $1" >&2; exit 2 ;;
    *)
      if [[ -z "$REMOTE_USER" ]]; then
        REMOTE_USER="$1"
      else
        echo "❌ 多余参数: $1" >&2; exit 2
      fi
      shift ;;
  esac
done

REMOTE_USER="${REMOTE_USER:-$DEFAULT_USER}"

SSH_CMD=(ssh)
SCP_CMD=(scp)
if [[ -n "$SSH_PASS" ]]; then
  if ! command -v sshpass >/dev/null 2>&1; then
    echo "❌ 设置了 SSH_PASS，但本机没安装 sshpass（macOS: brew install hudochenkov/sshpass/sshpass）" >&2
    exit 1
  fi
  SSH_CMD=(sshpass -p "$SSH_PASS" ssh)
  SCP_CMD=(sshpass -p "$SSH_PASS" scp)
fi
SSH_OPTS=(-o StrictHostKeyChecking=no -o ConnectTimeout=10)

# ---------- 路径 ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE_TMP="/tmp/homework-deploy"
REMOTE_APP="/opt/homework"

# ---------- 彩色输出 ----------
c_g() { printf "\033[32m%s\033[0m\n" "$*"; }
c_y() { printf "\033[33m%s\033[0m\n" "$*"; }
c_c() { printf "\033[36m%s\033[0m\n" "$*"; }
c_r() { printf "\033[31m%s\033[0m\n" "$*"; }
c_b() { printf "\033[1m%s\033[0m\n" "$*"; }

# ---------- 健康检查（无需 SSH） ----------
# 自动选 base url：HTTPS 域名优先，否则回退到 IP:8787
pick_base_url() {
  if [[ -n "$DOMAIN" ]]; then
    if curl -fsS -m 5 -o /dev/null "https://${DOMAIN}/" 2>/dev/null; then
      echo "https://${DOMAIN}"
      return
    fi
  fi
  echo "http://${HOST}:8787"
}

health_check() {
  local BASE
  BASE=$(pick_base_url)
  c_b "🩺 端点：${BASE}"
  echo ""

  c_b "🩺 健康检查 → ${BASE}/"
  local body
  body=$(curl -s -m 8 "${BASE}/" || true)
  if [[ -z "$body" ]]; then
    c_r "❌ 不可达"
    return 1
  fi
  echo "$body" | head -8
  echo ""

  c_b "🩺 题库覆盖率 → /api/questions/coverage"
  local cov
  cov=$(curl -s -m 8 "${BASE}/api/questions/coverage" || true)
  if [[ "$cov" == *"summary"* ]]; then
    echo "$cov" | python3 -c "import sys,json;d=json.load(sys.stdin);s=d['summary'];print(f'   静态题: {s[\"totalQuestions\"]}, 生成器变体: {s[\"totalGenerators\"]}, 覆盖率: {s[\"coveragePercent\"]}%')" 2>/dev/null \
      || echo "   $(echo "$cov" | head -c 200)"
  else
    c_y "   ⚠️ /api/questions/coverage 无响应（旧版可能未部署）"
  fi
  echo ""

  c_b "🩺 TTS → /tts?text=你好"
  local code size
  read -r code size < <(curl -s -m 10 -o /dev/null -w "%{http_code} %{size_download}" "${BASE}/tts?text=你好&voice=zf_xiaoxiao")
  if [[ "$code" == "200" && "$size" -gt 1000 ]]; then
    c_g "   ✅ TTS HTTP 200, ${size} bytes"
  else
    c_y "   ⚠️ TTS 异常: HTTP $code, ${size} bytes（可能 VOLC_TOKEN 失效或 kokoro 模型未上传）"
  fi
  echo ""

  c_b "🩺 抽题 → /api/questions/pick?grade=1&subject=math&n=1"
  local pick
  pick=$(curl -s -m 8 "${BASE}/api/questions/pick?grade=1&subject=math&n=1" || true)
  if [[ "$pick" == *'"q":'* ]]; then
    c_g "   ✅ 抽题接口正常"
  else
    c_y "   ⚠️ 抽题异常: $(echo "$pick" | head -c 120)"
  fi
}

# ---------- --check：只做健康检查后退出 ----------
if [[ "$CHECK_ONLY" == 1 ]]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  c_c "  健康检查模式（不部署）→ ${HOST}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  health_check
  exit 0
fi

# ---------- 本地文件检查 ----------
for f in index.html proxy.js package.json package-lock.json; do
  if [[ ! -f "$SCRIPT_DIR/$f" ]]; then
    echo "❌ 本地缺少 $f（应在 $SCRIPT_DIR/）" >&2
    exit 1
  fi
done

for d in lib scripts static/app static/app/engines generators legacy; do
  if [[ ! -d "$SCRIPT_DIR/$d" ]]; then
    echo "❌ 本地缺少 $d/（应在 $SCRIPT_DIR/）" >&2
    exit 1
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
c_c "  小学生作业辅导 · 一键部署"
echo "  目标：${REMOTE_USER}@${HOST}:${SSH_PORT}"
echo "  模式：${MODE}$([[ $SKIP_SEED == 1 ]] && echo ' (--no-seed)')"
echo "  本地：${SCRIPT_DIR}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ---------- 连通性快速探测 ----------
if ! "${SSH_CMD[@]}" "${SSH_OPTS[@]}" -p "$SSH_PORT" -o BatchMode=no \
         "$REMOTE_USER@$HOST" "echo ok" >/dev/null 2>&1; then
  c_y "⚠️  第一次连接可能需要输入密码/接受主机指纹，继续..."
fi

# ---------- 1) 上传文件 ----------
c_c "① 上传文件到远端 ${REMOTE_TMP}/ ..."

FILES=(index.html proxy.js package.json package-lock.json)
DIRS=(lib scripts static generators legacy)
if [[ "$MODE" == "install" || "$MODE" == "service" ]]; then
  [[ -f "$SCRIPT_DIR/homework.service" ]] && FILES+=(homework.service) \
    || { c_r "❌ 缺少 homework.service，无法以 $MODE 模式部署"; exit 1; }
fi
[[ -f "$SCRIPT_DIR/DEPLOY.md" ]] && FILES+=(DEPLOY.md)
[[ -f "$SCRIPT_DIR/README.md" ]] && FILES+=(README.md)

"${SSH_CMD[@]}" "${SSH_OPTS[@]}" -p "$SSH_PORT" "$REMOTE_USER@$HOST" \
  "sudo rm -rf $REMOTE_TMP && mkdir -p $REMOTE_TMP"

for f in "${FILES[@]}"; do
  printf "   ▶ %s ... " "$f"
  "${SCP_CMD[@]}" "${SSH_OPTS[@]}" -q -P "$SSH_PORT" "$SCRIPT_DIR/$f" "$REMOTE_USER@$HOST:$REMOTE_TMP/"
  echo "✅"
done

for d in "${DIRS[@]}"; do
  printf "   ▶ %s/ ... " "$d"
  "${SCP_CMD[@]}" "${SSH_OPTS[@]}" -q -r -P "$SSH_PORT" "$SCRIPT_DIR/$d" "$REMOTE_USER@$HOST:$REMOTE_TMP/"
  echo "✅"
done

# ---------- 2) 生成并上传远端执行脚本 ----------
REMOTE_RUNNER="/tmp/homework-deploy-runner.sh"
LOCAL_RUNNER="$(mktemp -t homework-runner.XXXXXX.sh)"
trap 'rm -f "$LOCAL_RUNNER"' EXIT

cat > "$LOCAL_RUNNER" << REMOTE_SCRIPT
#!/usr/bin/env bash
set -euo pipefail
MODE="\${1:-update}"
SKIP_SEED=${SKIP_SEED}
REMOTE_TMP="/tmp/homework-deploy"
REMOTE_APP="/opt/homework"
APP_USER=""
APP_GROUP=""

c_g() { printf "\033[32m%s\033[0m\n" "\$*"; }
c_y() { printf "\033[33m%s\033[0m\n" "\$*"; }
c_c() { printf "\033[36m%s\033[0m\n" "\$*"; }
c_r() { printf "\033[31m%s\033[0m\n" "\$*"; }

detect_app_owner() {
  if id homework &>/dev/null; then
    APP_USER="homework"
    APP_GROUP="\$(id -gn homework)"
  else
    APP_USER="\$(id -un)"
    APP_GROUP="\$(id -gn)"
  fi
}

# 把 \$REMOTE_TMP 下的应用文件复制到 \$REMOTE_APP，覆盖旧版子目录
sync_app_files() {
  c_c "▶ 同步应用文件到 \$REMOTE_APP ..."
  sudo cp "\$REMOTE_TMP/index.html"        "\$REMOTE_APP/"
  sudo cp "\$REMOTE_TMP/proxy.js"          "\$REMOTE_APP/"
  sudo cp "\$REMOTE_TMP/package.json"      "\$REMOTE_APP/"
  sudo cp "\$REMOTE_TMP/package-lock.json" "\$REMOTE_APP/" 2>/dev/null || true
  [[ -f "\$REMOTE_TMP/README.md" ]]  && sudo cp "\$REMOTE_TMP/README.md"  "\$REMOTE_APP/" || true
  [[ -f "\$REMOTE_TMP/DEPLOY.md" ]]  && sudo cp "\$REMOTE_TMP/DEPLOY.md"  "\$REMOTE_APP/" || true

  # 整目录覆盖：先删旧版避免遗留文件
  for d in lib scripts static generators legacy; do
    sudo rm -rf "\$REMOTE_APP/\$d"
    sudo cp -r "\$REMOTE_TMP/\$d" "\$REMOTE_APP/"
  done

  # 清理重构前的旧根目录残留（已迁入 legacy/）
  for stale in grade1.js grade2.js grade3.js grade4.js grade5.js grade6.js curriculum.js questions.js; do
    if [[ -f "\$REMOTE_APP/\$stale" ]]; then
      c_y "   ▶ 清理旧文件 \$stale → 已在 legacy/"
      sudo rm -f "\$REMOTE_APP/\$stale"
    fi
  done

  sudo chown -R "\$APP_USER:\$APP_GROUP" "\$REMOTE_APP"
}

run_npm_install() {
  c_c "▶ 检查 npm 依赖 ..."
  cd "\$REMOTE_APP"
  sudo -u "\$APP_USER" npm install --omit=dev
  sudo -u "\$APP_USER" npm rebuild better-sqlite3 || true
}

run_db_setup() {
  c_c "▶ 数据库 schema 迁移 ..."
  cd "\$REMOTE_APP"
  sudo -u "\$APP_USER" npm run db:migrate
  if [[ "\$SKIP_SEED" == "1" ]]; then
    c_y "▶ 跳过 db:seed (--no-seed)"
  else
    c_c "▶ 灌入 curriculum / legacy / generators ..."
    sudo -u "\$APP_USER" npm run db:seed
  fi
}

restart_service() {
  c_c "▶ daemon-reload + 重启 homework.service ..."
  sudo systemctl daemon-reload
  sudo systemctl restart homework
  sleep 2
  c_c "▶ 状态："
  sudo systemctl status homework --no-pager -l | head -8 || true
}

detect_app_owner

case "\$MODE" in
  install)
    c_c "▶ 检查 Node.js..."
    need_node=1
    if command -v node >/dev/null; then
      ver=\$(node -v | sed 's/v//;s/\..*//')
      [[ "\$ver" -ge 18 ]] && need_node=0 && c_g "   已安装 Node \$(node -v)"
    fi
    if [[ \$need_node -eq 1 ]]; then
      c_c "▶ 安装 Node.js 20..."
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      sudo apt-get install -y nodejs
    fi

    c_c "▶ 创建 homework 用户和 \$REMOTE_APP ..."
    id homework &>/dev/null || sudo useradd -r -m -d "\$REMOTE_APP" -s /bin/bash homework
    APP_USER="homework"
    APP_GROUP="\$(id -gn homework)"
    sudo mkdir -p "\$REMOTE_APP"

    sync_app_files
    sudo cp "\$REMOTE_TMP/homework.service" /etc/systemd/system/

    run_npm_install
    run_db_setup

    c_c "▶ 开放防火墙 8787 端口（如有 ufw）..."
    command -v ufw >/dev/null && sudo ufw allow 8787/tcp || true

    echo ""
    c_y "⚠️  TTS 配置（可选 — 不配置时本地 Kokoro 模型作为兜底）："
    c_y "       sudo nano /etc/systemd/system/homework.service"
    c_y "    填完后："
    c_y "       sudo systemctl daemon-reload && sudo systemctl enable --now homework"
    c_y "       sudo journalctl -u homework -n 20 --no-pager"
    ;;

  service)
    c_c "▶ 读取已有 Token / AppID（保留以免覆盖）..."
    OLD_TOKEN=""
    OLD_APPID=""
    if [[ -f /etc/systemd/system/homework.service ]]; then
      OLD_TOKEN=\$(sudo grep -oP '(?<=VOLC_TOKEN=)\S+' /etc/systemd/system/homework.service || true)
      OLD_APPID=\$(sudo grep -oP '(?<=VOLC_APPID=)\S+' /etc/systemd/system/homework.service || true)
    fi

    sync_app_files
    sudo cp "\$REMOTE_TMP/homework.service" /etc/systemd/system/
    sudo sed -i "s|^User=.*|User=\${APP_USER}|;s|^Group=.*|Group=\${APP_GROUP}|" /etc/systemd/system/homework.service

    run_npm_install
    run_db_setup

    if [[ -n "\$OLD_TOKEN" && "\$OLD_TOKEN" != *"填你的"* && "\$OLD_TOKEN" != *"AccessToken"* ]]; then
      c_g "   ▶ 保留已有的 VOLC_TOKEN"
      sudo sed -i "s|Environment=VOLC_TOKEN=.*|Environment=VOLC_TOKEN=\${OLD_TOKEN}|" /etc/systemd/system/homework.service
    else
      c_y "   ⚠️ 未检测到旧 Token；本地 Kokoro 仍可作为 TTS 兜底"
    fi
    if [[ -n "\$OLD_APPID" && "\$OLD_APPID" != *"填你的"* ]]; then
      sudo sed -i "s|Environment=VOLC_APPID=.*|Environment=VOLC_APPID=\${OLD_APPID}|" /etc/systemd/system/homework.service
    fi

    restart_service
    ;;

  update)
    sync_app_files
    run_npm_install
    run_db_setup

    c_c "▶ 重启服务 ..."
    sudo systemctl restart homework
    sleep 2
    c_c "▶ 日志（最近 15 行）:"
    sudo journalctl -u homework -n 15 --no-pager || true
    ;;

  *)
    echo "❌ 未知模式: \$MODE" >&2; exit 2 ;;
esac

echo ""
c_g "✅ 远端操作完成"
REMOTE_SCRIPT

c_c "② 上传部署脚本 ..."
"${SCP_CMD[@]}" "${SSH_OPTS[@]}" -q -P "$SSH_PORT" "$LOCAL_RUNNER" "$REMOTE_USER@$HOST:$REMOTE_RUNNER"
"${SSH_CMD[@]}" "${SSH_OPTS[@]}" -p "$SSH_PORT" "$REMOTE_USER@$HOST" "chmod +x $REMOTE_RUNNER"

# ---------- 3) 远程执行 ----------
c_c "③ 在远端执行（可能会问 sudo 密码）..."
echo ""
"${SSH_CMD[@]}" "${SSH_OPTS[@]}" -t -p "$SSH_PORT" "$REMOTE_USER@$HOST" "bash $REMOTE_RUNNER $MODE"

# ---------- 4) 部署后健康检查 ----------
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
c_g "🎉 部署完成 — 跑一遍健康检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sleep 1
health_check || c_y "⚠️ 健康检查有警告，请用 sudo journalctl -u homework -n 50 排查"

echo ""
BASE_FOR_LINKS=$(pick_base_url)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
c_g "📍 访问入口"
echo "   主页:      ${BASE_FOR_LINKS}/app"
echo "   健康检查:  ${BASE_FOR_LINKS}/"
echo "   覆盖率:    ${BASE_FOR_LINKS}/api/questions/coverage"
echo "   TTS 直测:  ${BASE_FOR_LINKS}/tts?text=你好小朋友&voice=zf_xiaoxiao"
[[ -n "$DOMAIN" && "$BASE_FOR_LINKS" != "https://${DOMAIN}" ]] \
  && c_y "   ⚠️ 域名 https://${DOMAIN}/ 当前不可达，已退回 IP:8787" || true
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
