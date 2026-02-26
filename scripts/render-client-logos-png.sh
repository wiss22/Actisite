#!/usr/bin/env bash
set -euo pipefail
SRC_HQ="/Users/wissemchouk/Downloads/Actisite/static/client-logos-hq"
OUT="/Users/wissemchouk/Downloads/Actisite/static/client-logos-png"
mkdir -p "$OUT"
for f in \
  bnp-paribas-clean.svg \
  credit-agricole.svg \
  societe-generale.svg \
  la-banque-postale.svg \
  chanel.svg \
  dior.svg \
  sncf-clean.svg \
  transavia.svg \
  rte.svg \
  euroapi.svg \
  ag2r-clean.svg \
  esri.svg \
  edotleclerc.svg \
  betclic.svg
  do
  src="$SRC_HQ/$f"
  [ -f "$src" ] || { echo "MISS $f"; continue; }
  qlmanage -t -s 512 -o "$OUT" "$src" >/tmp/ql-render.out 2>/tmp/ql-render.err
  generated="$OUT/$f.png"
  target="$OUT/${f%.svg}.png"
  if [ -f "$generated" ]; then
    mv "$generated" "$target"
    echo "OK $target"
  else
    echo "FAIL $f"
  fi
done
ls -la "$OUT" | sed -n '1,200p'
