#!/usr/bin/env bash
set -Eeuo pipefail

# Usage examples:
#   bash scripts/update-server.sh
#   BRANCH=main RESTART_MODE=pm2 PM2_APP_NAME=ocb-app bash scripts/update-server.sh
#   BRANCH=main RESTART_MODE=systemd SYSTEMD_SERVICE=ocb.service bash scripts/update-server.sh
#
# What this script does:
# 1. Backs up old repo-local runtime data files.
# 2. Migrates runtime data out of the git working tree.
# 3. Updates DATA_DIR in .env so the server reads/writes runtime data outside the repo.
# 4. Pulls the latest code.
# 5. Installs dependencies, builds, and restarts the app.

PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BRANCH="${BRANCH:-main}"
ENV_FILE="${ENV_FILE:-$PROJECT_DIR/.env}"
RUNTIME_DATA_DIR="${RUNTIME_DATA_DIR:-/var/lib/ocb-data}"
BACKUP_ROOT="${BACKUP_ROOT:-$PROJECT_DIR/.deploy-backups}"
RESTART_MODE="${RESTART_MODE:-none}" # none | pm2 | systemd
PM2_APP_NAME="${PM2_APP_NAME:-}"
SYSTEMD_SERVICE="${SYSTEMD_SERVICE:-}"
NPM_INSTALL_CMD="${NPM_INSTALL_CMD:-npm ci}"

timestamp() {
  date +"%Y%m%d-%H%M%S"
}

ensure_env_file() {
  if [[ ! -f "$ENV_FILE" ]]; then
    touch "$ENV_FILE"
  fi
}

set_env_value() {
  local key="$1"
  local value="$2"
  ensure_env_file

  if grep -qE "^${key}=" "$ENV_FILE"; then
    sed -i "s#^${key}=.*#${key}=${value}#g" "$ENV_FILE"
  else
    printf "\n%s=%s\n" "$key" "$value" >> "$ENV_FILE"
  fi
}

backup_file_if_exists() {
  local file_path="$1"
  local backup_dir="$2"

  if [[ -f "$file_path" ]]; then
    cp "$file_path" "$backup_dir/"
  fi
}

migrate_runtime_data() {
  local repo_data_dir="$PROJECT_DIR/data"
  local backup_dir="$BACKUP_ROOT/$(timestamp)"

  mkdir -p "$backup_dir"
  mkdir -p "$RUNTIME_DATA_DIR"

  local legacy_files=(
    "$repo_data_dir/registered-phones.json"
    "$repo_data_dir/final-submissions.jsonl"
    "$repo_data_dir/submissions.jsonl"
  )

  echo "[deploy] backing up legacy data files to $backup_dir"
  for file_path in "${legacy_files[@]}"; do
    backup_file_if_exists "$file_path" "$backup_dir"
  done

  if [[ -f "$repo_data_dir/registered-phones.json" && ! -f "$RUNTIME_DATA_DIR/registered-phones.json" ]]; then
    cp "$repo_data_dir/registered-phones.json" "$RUNTIME_DATA_DIR/registered-phones.json"
  fi

  if [[ -f "$repo_data_dir/final-submissions.jsonl" && ! -f "$RUNTIME_DATA_DIR/final-submissions.jsonl" ]]; then
    cp "$repo_data_dir/final-submissions.jsonl" "$RUNTIME_DATA_DIR/final-submissions.jsonl"
  fi

  set_env_value "DATA_DIR" "$RUNTIME_DATA_DIR"
}

clear_tracked_runtime_files() {
  cd "$PROJECT_DIR"

  local tracked_files=(
    "data/registered-phones.json"
    "data/final-submissions.jsonl"
    "data/submissions.jsonl"
  )

  for relative_path in "${tracked_files[@]}"; do
    if git ls-files --error-unmatch "$relative_path" >/dev/null 2>&1; then
      echo "[deploy] resetting tracked runtime file: $relative_path"
      git restore --staged --worktree -- "$relative_path" || true
    fi
  done
}

update_code() {
  cd "$PROJECT_DIR"
  echo "[deploy] fetching latest code from origin/$BRANCH"
  git fetch origin "$BRANCH"
  git pull --ff-only origin "$BRANCH"
}

install_and_build() {
  cd "$PROJECT_DIR"
  echo "[deploy] installing dependencies with: $NPM_INSTALL_CMD"
  eval "$NPM_INSTALL_CMD"
  echo "[deploy] building project"
  npm run build
}

restart_app() {
  case "$RESTART_MODE" in
    pm2)
      if [[ -z "$PM2_APP_NAME" ]]; then
        echo "[deploy] PM2_APP_NAME is required when RESTART_MODE=pm2" >&2
        exit 1
      fi
      echo "[deploy] restarting pm2 app: $PM2_APP_NAME"
      pm2 restart "$PM2_APP_NAME"
      ;;
    systemd)
      if [[ -z "$SYSTEMD_SERVICE" ]]; then
        echo "[deploy] SYSTEMD_SERVICE is required when RESTART_MODE=systemd" >&2
        exit 1
      fi
      echo "[deploy] restarting systemd service: $SYSTEMD_SERVICE"
      sudo systemctl restart "$SYSTEMD_SERVICE"
      ;;
    none)
      echo "[deploy] build completed. Restart your process manually."
      ;;
    *)
      echo "[deploy] unsupported RESTART_MODE: $RESTART_MODE" >&2
      exit 1
      ;;
  esac
}

main() {
  echo "[deploy] project dir: $PROJECT_DIR"
  echo "[deploy] branch: $BRANCH"
  echo "[deploy] runtime data dir: $RUNTIME_DATA_DIR"

  migrate_runtime_data
  clear_tracked_runtime_files
  update_code
  install_and_build
  restart_app

  echo "[deploy] update completed"
}

main "$@"
