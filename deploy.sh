#!/usr/bin/env bash
# ============================================================
#  deploy.sh — 一键部署/更新 "小学生作业辅导" 到 192.168.3.79
#
#  用法：
#    ./deploy.sh                         # 普通更新（只覆盖 index.html + proxy.js，重启）
#    ./deploy.sh tao                     # 指定 SSH 用户名
#    ./deploy.sh tao --service           # 连 systemd unit 一起覆盖（自动保留你的 Token）
#    ./deploy.sh tao --install           # 首次安装（装 Node / 建用户 / 装 service）
#    SSH_USER=tao ./deploy.sh            # 环境变量形式
#    HOST=10.0.0.5 ./deploy.sh tao       # 改目标 IP
#
#  依赖：本机有 ssh / scp；对方服务器能连（有密码或 SSH Key 都行）
# ============================================================

set -euo pipefail

# ---------- 默认配置（可通过环境变量 / 位置参数覆盖） ----------
HOST="${HOST:-192.168.3.79}"
SSH_PORT="${SSH_PORT:-22}"
DEFAULT_USER="taobinxian"
REMOTE_USER="${SSH_USER:-}"
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

# ---------- 路径 ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REMOTE_TMP="/tmp/homework-deploy"
REMOTE_APP="/opt/homework"

# ---------- 本地文件检查 ----------
for f in index.html proxy.js; do
  if [[ ! -f "$SCRIPT_DIR/$f" ]]; then
    echo "❌ 本地缺少 $f（应在 $SCRIPT_DIR/）" >&2
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
if ! ssh -p "$SSH_PORT" -o ConnectTimeout=5 -o BatchMode=no \
         "$REMOTE_USER@$HOST" "echo ok" >/dev/null 2>&1; then
  c_y "⚠️  第一次连接可能需要输入密码/接受主机指纹，继续..."
fi

# ---------- 1) 上传文件 ----------
c_c "① 上传文件到远端 ${REMOTE_TMP}/ ..."

FILES=(index.html proxy.js)
if [[ "$MODE" == "install" || "$MODE" == "service" ]]; then
  [[ -f "$SCRIPT_DIR/homework.service" ]] && FILES+=(homework.service) \
    || { c_r "❌ 缺少 homework.service，无法以 $MODE 模式部署"; exit 1; }
fi
[[ -f "$SCRIPT_DIR/DEPLOY.md" ]] && FILES+=(DEPLOY.md)

ssh -p "$SSH_PORT" "$REMOTE_USER@$HOST" "mkdir -p $REMOTE_TMP"

for f in "${FILES[@]}"; do
  printf "   ▶ %s ... " "$f"
  scp -q -P "$SSH_PORT" "$SCRIPT_DIR/$f" "$REMOTE_USER@$HOST:$REMOTE_TMP/"
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

c_g() { printf "\033[32m%s\033[0m\n" "$*"; }
c_y() { printf "\033[33m%s\033[0m\n" "$*"; }
c_c() { printf "\033[36m%s\033[0m\n" "$*"; }

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
    sudo mkdir -p "$REMOTE_APP"

    c_c "▶ 拷贝应用文件 ..."
    sudo cp "$REMOTE_TMP/index.html"       "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/proxy.js"         "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/homework.service" /etc/systemd/system/
    sudo chown -R homework:homework "$REMOTE_APP"

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
    sudo cp "$REMOTE_TMP/homework.service" /etc/systemd/system/
    sudo chown homework:homework "$REMOTE_APP/index.html" "$REMOTE_APP/proxy.js"

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
    # ----- 常规更新（只动 html+js，最快） -----
    c_c "▶ 覆盖 index.html / proxy.js ..."
    sudo cp "$REMOTE_TMP/index.html" "$REMOTE_APP/"
    sudo cp "$REMOTE_TMP/proxy.js"   "$REMOTE_APP/"
    sudo chown homework:homework "$REMOTE_APP/index.html" "$REMOTE_APP/proxy.js"

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
scp -q -P "$SSH_PORT" "$LOCAL_RUNNER" "$REMOTE_USER@$HOST:$REMOTE_RUNNER"
ssh -p "$SSH_PORT" "$REMOTE_USER@$HOST" "chmod +x $REMOTE_RUNNER"

# ---------- 3) 远程执行 ----------
c_c "③ 在远端执行（可能会问 sudo 密码）..."
echo ""
ssh -t -p "$SSH_PORT" "$REMOTE_USER@$HOST" "bash $REMOTE_RUNNER $MODE"

# ---------- 4) 收尾输出 ----------
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
c_g "🎉 部署完成"
echo ""
echo "   主页:      http://${HOST}:8787/app"
echo "   健康检查:  http://${HOST}:8787/"
echo "   TTS 直测:  http://${HOST}:8787/tts?text=你好小朋友&voice=saturn_zh_female_keainvsheng_tob"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
