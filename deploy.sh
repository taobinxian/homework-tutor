#!/usr/bin/env bash
# ============================================================
#  deploy.sh — 一键部署/更新 "小学生作业辅导" 到 111.229.191.225
#
#  用法：
#    ./deploy.sh                         # 普通更新（只覆盖 index.html + proxy.js，重启）
#    ./deploy.sh tao                     # 指定 SSH 用户名
#    ./deploy.sh tao --service           # 连 systemd unit 一起覆盖（自动保留你的 Token）
#    ./deploy.sh tao --install           # 首次安装（装 Node / 建用户 / 装 service）
#    SSH_USER=tao ./deploy.sh            # 环境变量形式
#    SSH_PASS=xxx ./deploy.sh            # 密码登录（不写入脚本）
#    HOST=10.0.0.5 ./deploy.sh tao       # 临时改目标 IP
#
#  依赖：本机有 ssh / scp；对方服务器能连（有密码或 SSH Key 都行）
# ============================================================

set -euo pipefail

# ---------- 默认配置（可通过环境变量 / 位置参数覆盖） ----------
HOST="${HOST:-111.229.191.225}"
SSH_PORT="${SSH_PORT:-22}"
DEFAULT_USER="ubuntu"
REMOTE_USER="${SSH_USER:-}"
SSH_PASS="${SSH_PASS:-}"
MODE="update"   # update | install | service

# ---------- 参数解析 ----------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --install)  MODE="install"; shift ;;
    --service)  MODE="service"; shift ;;
    --host=*)   HOST="${1#*=}"; shift ;;
    --port=*)   SSH_PORT="${1#*=}"; shift ;;
    -h|--help)
      sed -n '2,15p' "$0" | sed 's/^#//'
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
    echo "❌ 设置了 SSH_PASS，但本机没有安装 sshpass" >&2
    exit 1
  fi
  SSH_CMD=(sshpass -p "$SSH_PASS" ssh)
  SCP_CMD=(sshpass -p "$SSH_PASS" scp)
fi

# ---------- 路径 ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE_TMP="/tmp/homework-deploy"
REMOTE_APP="/opt/homework"

# ---------- 本地文件检查 ----------
for f in index.html proxy.js package.json package-lock.json; do
  if [[ ! -f "$SCRIPT_DIR/$f" ]]; then
    echo "❌ 本地缺少 $f（应在 $SCRIPT_DIR/）" >&2
    exit 1
  fi
done

# 模块化前端 + 题库迁移所需子目录
for d in lib scripts static/app static/app/engines generators legacy; do
  if [[ ! -d "$SCRIPT_DIR/$d" ]]; then
    echo "❌ 本地缺少 $d/（应在 $SCRIPT_DIR/）" >&2
    exit 1
  fi
done

# 彩色输出小工具
c_g() { printf "\033[32m%s\033[0m\n" "$*"; }
c_y() { printf "\033[33m%s\033[0m\n" "$*"; }
c_c() { printf "\033[36m%s\033[0m\n" "$*"; }
c_r() { printf "\033[31m%s\033[0m\n" "$*"; }

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
c_c "  小学生作业辅导 · 一键部署"
echo "  目标：${REMOTE_USER}@${HOST}:${SSH_PORT}"
echo "  模式：${MODE}"
echo "  本地：${SCRIPT_DIR}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ---------- 连通性快速探测 ----------
if ! "${SSH_CMD[@]}" -p "$SSH_PORT" -o ConnectTimeout=5 -o BatchMode=no \
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

"${SSH_CMD[@]}" -p "$SSH_PORT" "$REMOTE_USER@$HOST" "sudo rm -rf $REMOTE_TMP && mkdir -p $REMOTE_TMP"

for f in "${FILES[@]}"; do
  printf "   ▶ %s ... " "$f"
  "${SCP_CMD[@]}" -q -P "$SSH_PORT" "$SCRIPT_DIR/$f" "$REMOTE_USER@$HOST:$REMOTE_TMP/"
  echo "✅"
done

for d in "${DIRS[@]}"; do
  printf "   ▶ %s/ ... " "$d"
  "${SCP_CMD[@]}" -q -r -P "$SSH_PORT" "$SCRIPT_DIR/$d" "$REMOTE_USER@$HOST:$REMOTE_TMP/"
  echo "✅"
done

# ---------- 2) 生成并上传远端执行脚本 ----------
REMOTE_RUNNER="/tmp/homework-deploy-runner.sh"
LOCAL_RUNNER="$(mktemp -t homework-runner.XXXXXX.sh)"
trap 'rm -f "$LOCAL_RUNNER"' EXIT

cat > "$LOCAL_RUNNER" << 'REMOTE_SCRIPT'
#!/usr/bin/env bash
set -euo pipefail
MODE="${1:-update}"
REMOTE_TMP="/tmp/homework-deploy"
REMOTE_APP="/opt/homework"
APP_USER=""
APP_GROUP=""

c_g() { printf "\033[32m%s\033[0m\n" "$*"; }
c_y() { printf "\033[33m%s\033[0m\n" "$*"; }
c_c() { printf "\033[36m%s\033[0m\n" "$*"; }

detect_app_owner() {
  if id homework &>/dev/null; then
    APP_USER="homework"
    APP_GROUP="$(id -gn homework)"
  else
    APP_USER="$(id -un)"
    APP_GROUP="$(id -gn)"
  fi
}

detect_app_owner

case "$MODE" in
  install)
    # ----- 首次安装 -----
    c_c "▶ 检查 Node.js..."
    need_node=1
    if command -v node >/dev/null; then
      ver=$(node -v | sed 's/v//;s/\..*//')
      [[ "$ver" -ge 18 ]] && need_node=0 && c_g "   已安装 Node $(node -v)"
    fi
    if [[ $need_node -eq 1 ]]; then
      c_c "▶ 安装 Node.js 20..."
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      sudo apt-get install -y nodejs
    fi

    c_c "▶ 创建 homework 用户和 $REMOTE_APP ..."
    id homework &>/dev/null || sudo useradd -r -m -d "$REMOTE_APP" -s /bin/bash homework
    APP_USER="homework"
    APP_GROUP="$(id -gn homework)"
    sudo mkdir -p "$REMOTE_APP"

    c_c "▶ 拷贝应用文件 ..."
    sudo cp "$REMOTE_TMP/index.html"       "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/proxy.js"         "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/package.json"     "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/package-lock.json" "$REMOTE_APP/" 2>/dev/null || true
    [[ -f "$REMOTE_TMP/README.md" ]] && sudo cp "$REMOTE_TMP/README.md" "$REMOTE_APP/" || true
    sudo rm -rf "$REMOTE_APP/lib" "$REMOTE_APP/scripts" "$REMOTE_APP/static" "$REMOTE_APP/generators" "$REMOTE_APP/legacy"
    sudo cp -r "$REMOTE_TMP/lib"        "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/scripts"    "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/static"     "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/generators" "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/legacy"     "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/homework.service" /etc/systemd/system/
    sudo chown -R "$APP_USER:$APP_GROUP" "$REMOTE_APP"

    c_c "▶ npm install + 数据库迁移 ..."
    cd "$REMOTE_APP"
    sudo -u "$APP_USER" npm install --omit=dev
    sudo -u "$APP_USER" npm rebuild better-sqlite3 || true
    sudo -u "$APP_USER" npm run db:migrate
    sudo -u "$APP_USER" npm run db:seed

    c_c "▶ 开放防火墙 8787 端口（如有 ufw）..."
    command -v ufw >/dev/null && sudo ufw allow 8787/tcp || true

    echo ""
    c_y "⚠️  现在请编辑 service 文件填 VOLC_TOKEN："
    c_y "       sudo nano /etc/systemd/system/homework.service"
    c_y "    填完后执行："
    c_y "       sudo systemctl daemon-reload && sudo systemctl enable --now homework"
    c_y "       sudo journalctl -u homework -n 20 --no-pager"
    ;;

  service)
    # ----- 覆盖 service 文件（自动保留 Token/AppID） -----
    c_c "▶ 读取已有 Token / AppID ..."
    OLD_TOKEN=""
    OLD_APPID=""
    if [[ -f /etc/systemd/system/homework.service ]]; then
      OLD_TOKEN=$(sudo grep -oP '(?<=VOLC_TOKEN=)\S+' /etc/systemd/system/homework.service || true)
      OLD_APPID=$(sudo grep -oP '(?<=VOLC_APPID=)\S+' /etc/systemd/system/homework.service || true)
    fi

    c_c "▶ 覆盖文件 ..."
    sudo cp "$REMOTE_TMP/index.html"       "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/proxy.js"         "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/package.json"     "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/package-lock.json" "$REMOTE_APP/" 2>/dev/null || true
    [[ -f "$REMOTE_TMP/README.md" ]] && sudo cp "$REMOTE_TMP/README.md" "$REMOTE_APP/" || true
    sudo rm -rf "$REMOTE_APP/lib" "$REMOTE_APP/scripts" "$REMOTE_APP/static" "$REMOTE_APP/generators" "$REMOTE_APP/legacy"
    sudo cp -r "$REMOTE_TMP/lib"        "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/scripts"    "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/static"     "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/generators" "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/legacy"     "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/homework.service" /etc/systemd/system/
    sudo sed -i "s|^User=.*|User=${APP_USER}|;s|^Group=.*|Group=${APP_GROUP}|" /etc/systemd/system/homework.service
    sudo chown -R "$APP_USER:$APP_GROUP" "$REMOTE_APP"

    c_c "▶ npm install + 数据库迁移（service 模式）..."
    cd "$REMOTE_APP"
    sudo -u "$APP_USER" npm install --omit=dev
    sudo -u "$APP_USER" npm rebuild better-sqlite3 || true
    sudo -u "$APP_USER" npm run db:migrate
    sudo -u "$APP_USER" npm run db:seed

    # 回灌旧 Token（仅当旧值不是占位符时）
    if [[ -n "$OLD_TOKEN" && "$OLD_TOKEN" != *"填你的"* && "$OLD_TOKEN" != *"AccessToken"* ]]; then
      c_g "   ▶ 保留已有的 VOLC_TOKEN"
      sudo sed -i "s|Environment=VOLC_TOKEN=.*|Environment=VOLC_TOKEN=${OLD_TOKEN}|" /etc/systemd/system/homework.service
    else
      c_y "   ⚠️  未检测到有效的旧 Token，请手动编辑："
      c_y "       sudo nano /etc/systemd/system/homework.service"
    fi
    if [[ -n "$OLD_APPID" && "$OLD_APPID" != *"填你的"* ]]; then
      sudo sed -i "s|Environment=VOLC_APPID=.*|Environment=VOLC_APPID=${OLD_APPID}|" /etc/systemd/system/homework.service
    fi

    c_c "▶ daemon-reload 并重启 ..."
    sudo systemctl daemon-reload
    sudo systemctl restart homework
    sleep 1
    c_c "▶ 日志（最近 20 行）:"
    sudo journalctl -u homework -n 20 --no-pager || true
    ;;

  update)
    # ----- 常规更新（覆盖代码 + 跑迁移） -----
    c_c "▶ 覆盖代码与子目录 ..."
    sudo cp "$REMOTE_TMP/index.html"       "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/proxy.js"         "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/package.json"     "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/package-lock.json" "$REMOTE_APP/" 2>/dev/null || true
    [[ -f "$REMOTE_TMP/README.md" ]] && sudo cp "$REMOTE_TMP/README.md" "$REMOTE_APP/" || true
    sudo rm -rf "$REMOTE_APP/lib" "$REMOTE_APP/scripts" "$REMOTE_APP/static" "$REMOTE_APP/generators" "$REMOTE_APP/legacy"
    sudo cp -r "$REMOTE_TMP/lib"        "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/scripts"    "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/static"     "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/generators" "$REMOTE_APP/"
    sudo cp -r "$REMOTE_TMP/legacy"     "$REMOTE_APP/"
    sudo chown -R "$APP_USER:$APP_GROUP" "$REMOTE_APP"

    c_c "▶ 检查 npm 依赖 ..."
    cd "$REMOTE_APP"
    sudo -u "$APP_USER" npm install --omit=dev
    sudo -u "$APP_USER" npm rebuild better-sqlite3 || true

    c_c "▶ 数据库迁移 + seed ..."
    sudo -u "$APP_USER" npm run db:migrate
    sudo -u "$APP_USER" npm run db:seed

    c_c "▶ 重启服务 ..."
    sudo systemctl restart homework
    sleep 1
    c_c "▶ 日志（最近 15 行）:"
    sudo journalctl -u homework -n 15 --no-pager || true
    ;;

  *)
    echo "❌ 未知模式: $MODE" >&2; exit 2 ;;
esac

echo ""
c_g "✅ 远端操作完成"
REMOTE_SCRIPT

c_c "② 上传部署脚本 ..."
"${SCP_CMD[@]}" -q -P "$SSH_PORT" "$LOCAL_RUNNER" "$REMOTE_USER@$HOST:$REMOTE_RUNNER"
"${SSH_CMD[@]}" -p "$SSH_PORT" "$REMOTE_USER@$HOST" "chmod +x $REMOTE_RUNNER"

# ---------- 3) 远程执行 ----------
c_c "③ 在远端执行（可能会问 sudo 密码）..."
echo ""
"${SSH_CMD[@]}" -t -p "$SSH_PORT" "$REMOTE_USER@$HOST" "bash $REMOTE_RUNNER $MODE"

# ---------- 4) 收尾输出 ----------
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
c_g "🎉 部署完成"
echo ""
echo "   主页:      http://${HOST}:8787/app"
echo "   健康检查:  http://${HOST}:8787/"
echo "   TTS 直测:  http://${HOST}:8787/tts?text=你好小朋友&voice=saturn_zh_female_keainvsheng_tob"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
