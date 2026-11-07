#!/bin/zsh

# Start this exact local game. No package installation or remote download occurs here.
game_dir="$(cd -- "$(dirname -- "$0")" && pwd)"
cd "$game_dir" || exit 1

if ! command -v npm >/dev/null 2>&1; then
  print '没有找到 npm。请先安装 Node.js 22.12 或更新版本，再打开本文件。'
  read -r '?按回车关闭窗口。'
  exit 1
fi

if [[ ! -x node_modules/.bin/next ]]; then
  print '项目依赖还没有安装。请在这个目录的终端运行 npm ci，再打开本文件。'
  read -r '?按回车关闭窗口。'
  exit 1
fi

print '姐姐，我该怎么走 · 一纸童话'
print '服务器启动后，在浏览器打开 http://127.0.0.1:3000'
print '保持这个窗口打开，按 Control+C 停止游戏服务器。'
print ''
npm run dev
game_status=$?
if (( game_status != 0 )); then
  print ''
  print '服务器没有正常启动。若端口 3000 被占用，可按 README 中的方法更换端口。'
  read -r '?按回车关闭窗口。'
fi
exit "$game_status"
