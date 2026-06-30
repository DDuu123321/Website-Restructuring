#!/usr/bin/env bash
# restore-on-mac.sh — Restore the Bluven + CRM dev setup on a Mac from the
# drive packed by pack-for-mac.ps1.
#
# USAGE:
#   chmod +x restore-on-mac.sh        # (or run: bash restore-on-mac.sh ...)
#   ./restore-on-mac.sh "/Volumes/<DRIVE>/bluven-migration" [DEST_DIR]
#
#   DEST_DIR defaults to ~/dev/my-website
#
# Prereqs on the Mac: Node 20+, Docker Desktop running, `claude` installed.
# Override DB settings via env if needed, e.g.:
#   PG_IMAGE=postgres:17 ./restore-on-mac.sh /Volumes/USB/bluven-migration
# (Use an image >= the major version your Windows container used.)

set -uo pipefail

SRC="${1:?Usage: ./restore-on-mac.sh <migration-folder-on-drive> [dest-dir]}"
DEST="${2:-$HOME/dev/my-website}"
PG_CONTAINER="${PG_CONTAINER:-bluven-pg}"
PG_USER="${PG_USER:-postgres}"
PG_PASS="${PG_PASS:-postgres}"
PG_IMAGE="${PG_IMAGE:-postgres:16}"
NEWKEY=""

info(){ printf '\033[36m[restore] %s\033[0m\n' "$*"; }
warn(){ printf '\033[33m[restore] %s\033[0m\n' "$*"; }
die (){ printf '\033[31m[restore] ERROR: %s\033[0m\n' "$*"; exit 1; }

copy(){ if command -v rsync >/dev/null 2>&1; then rsync -a "$1/" "$2/"; else cp -R "$1/." "$2/"; fi; }

[ -d "$SRC" ] || die "migration folder not found: $SRC"

# --- 1. Copy repos -----------------------------------------------------------
info "copying repos into $DEST ..."
mkdir -p "$DEST"
if [ -d "$SRC/repos/bluven" ]; then mkdir -p "$DEST/bluven"; copy "$SRC/repos/bluven" "$DEST/bluven"; else warn "no bluven repo on drive"; fi
if [ -d "$SRC/repos/CRM" ];    then mkdir -p "$DEST/CRM";    copy "$SRC/repos/CRM"    "$DEST/CRM";    else warn "no CRM repo on drive"; fi

# --- 2. Restore Claude memory + history under the NEW path key ----------------
OLDKEYDIR="$(find "$SRC/claude-memory" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | head -1)"
if [ -n "$OLDKEYDIR" ] && [ -d "$DEST/bluven" ]; then
  ABS="$(cd "$DEST/bluven" && pwd)"
  NEWKEY="$(printf '%s' "$ABS" | sed 's/[^A-Za-z0-9]/-/g')"
  TARGET="$HOME/.claude/projects/$NEWKEY"
  info "restoring memory -> $TARGET"
  mkdir -p "$TARGET"
  copy "$OLDKEYDIR" "$TARGET"
else
  warn "skipping memory restore (no claude-memory on drive or bluven repo missing)"
fi

# --- 3. Install dependencies -------------------------------------------------
if command -v npm >/dev/null 2>&1; then
  for d in "bluven/cms" "bluven/frontend" "CRM"; do
    if [ -f "$DEST/$d/package.json" ]; then
      info "npm install: $d ..."
      ( cd "$DEST/$d" && npm install ) || warn "npm install failed in $d"
    fi
  done
  [ -f "$DEST/CRM/package.json" ] && { ( cd "$DEST/CRM" && npx prisma generate ) || warn "prisma generate failed"; }
else
  warn "npm not found — install Node 20+, then run npm install in cms/, frontend/, CRM/"
fi

# --- 4. Database: recreate container + restore dumps -------------------------
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  if docker ps -a --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
    docker start "$PG_CONTAINER" >/dev/null 2>&1 || true
  else
    info "creating container $PG_CONTAINER ($PG_IMAGE) ..."
    docker run -d --name "$PG_CONTAINER" -e POSTGRES_PASSWORD="$PG_PASS" -p 5432:5432 "$PG_IMAGE" >/dev/null \
      || die "could not start postgres container"
  fi
  info "waiting for postgres to accept connections ..."
  for _ in $(seq 1 30); do docker exec "$PG_CONTAINER" pg_isready -U "$PG_USER" >/dev/null 2>&1 && break; sleep 1; done

  shopt -s nullglob
  dumps=("$SRC"/db-dump/*.dump)
  if [ ${#dumps[@]} -eq 0 ]; then
    warn "no DB dumps on drive — skipping restore"
  else
    for dump in "${dumps[@]}"; do
      db="$(basename "$dump" .dump)"
      info "restoring database: $db ..."
      docker exec "$PG_CONTAINER" psql -U "$PG_USER" -c "CREATE DATABASE \"$db\";" >/dev/null 2>&1 || true
      docker cp "$dump" "$PG_CONTAINER:/tmp/$db.dump"
      docker exec "$PG_CONTAINER" pg_restore -U "$PG_USER" -d "$db" --clean --if-exists "/tmp/$db.dump" \
        || warn "pg_restore reported warnings for $db (usually harmless on a fresh DB)"
      docker exec "$PG_CONTAINER" rm -f "/tmp/$db.dump"
    done
  fi
else
  warn "Docker not running — start Docker Desktop and re-run, or restore the DB manually"
fi

# --- Done --------------------------------------------------------------------
cat <<EOF

[restore] DONE.

Verify:
  1. Confirm Claude loaded the memory:
        cd "$DEST/bluven" && claude
     You should see the SessionStart git banner + the MEMORY.md index in context.
     If the memory is NOT there, the path-key guess was off — find the folder
     Claude actually created and copy the memory into it:
        ls ~/.claude/projects
        cp -R "$HOME/.claude/projects/${NEWKEY:-<computed-key>}/." ~/.claude/projects/<that-folder>/

  2. Run the apps:
        cd "$DEST/bluven/frontend" && npm run dev     # :3000
        cd "$DEST/bluven/cms"      && npm run dev      # CMS  -> /admin (admin@bluven.org.au)
        cd "$DEST/CRM"             && npm run dev      # :3002

  3. Sanity-check DATABASE_URL in cms/.env and CRM/.env points at localhost:5432
     (it already should — the .env files came across with the repos).
EOF
