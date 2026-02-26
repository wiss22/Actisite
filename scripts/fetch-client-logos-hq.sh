#!/usr/bin/env bash
set -euo pipefail
OUT="/Users/wissemchouk/Downloads/Actisite/static/client-logos-hq"
while IFS='|' read -r file url; do
  [ -z "$file" ] && continue
  curl -L -sS "$url" -o "$OUT/$file"
  echo "OK $file"
done <<'EOF'
bnp-paribas.svg|https://upload.wikimedia.org/wikipedia/commons/3/34/Logo_BNP_Paribas_2016.svg
credit-agricole.svg|https://upload.wikimedia.org/wikipedia/commons/8/8f/Cr%C3%A9dit_Agricole_2020_logo.svg
societe-generale.svg|https://upload.wikimedia.org/wikipedia/commons/c/cd/Logo-SG-Soci%C3%A9t%C3%A9-G%C3%A9n%C3%A9rale.svg
la-banque-postale.svg|https://upload.wikimedia.org/wikipedia/commons/d/d4/Logo_La_Banque_postale_2022.svg
chanel.svg|https://upload.wikimedia.org/wikipedia/commons/3/35/Chanel_logo.svg
dior.svg|https://upload.wikimedia.org/wikipedia/commons/5/56/Dior_Logo_2022.svg
sncf.svg|https://upload.wikimedia.org/wikipedia/commons/9/90/SNCF_logo_sans_texte.svg
transavia.svg|https://upload.wikimedia.org/wikipedia/commons/1/1e/Logo_for_Transavia.svg
rte.svg|https://upload.wikimedia.org/wikipedia/commons/1/1f/RTE_logo.svg
euroapi.svg|https://upload.wikimedia.org/wikipedia/commons/8/8b/Euroapi.svg
ag2r.svg|https://upload.wikimedia.org/wikipedia/commons/f/fd/AG2R_La_Mondiale_logo.svg
groupama.svg|https://upload.wikimedia.org/wikipedia/commons/b/be/Groupama_logo.svg
betclic.svg|https://upload.wikimedia.org/wikipedia/commons/f/fe/Logo_Betclic_2019.svg
esri.svg|https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/esri.svg
edotleclerc.svg|https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/edotleclerc.svg
EOF
ls -la "$OUT"
