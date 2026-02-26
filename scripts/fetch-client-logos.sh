#!/usr/bin/env bash
set -euo pipefail
OUT="/Users/wissemchouk/Downloads/Actisite/static/client-logos"
while IFS='|' read -r name domain file; do
  [ -z "$name" ] && continue
  url="https://logo.clearbit.com/${domain}?size=256"
  tmp="${OUT}/${file}.tmp"
  dest="${OUT}/${file}.png"
  code=$(curl -L -sS -w "%{http_code}" "$url" -o "$tmp" || true)
  if [ "$code" = "200" ] && [ -s "$tmp" ]; then
    mv "$tmp" "$dest"
    echo "OK  $file ($domain)"
  else
    rm -f "$tmp"
    echo "MISS $file ($domain) [$code]"
  fi
done <<'EOF'
BNP Paribas|bnpparibas.com|bnp-paribas
Credit Agricole|credit-agricole.com|credit-agricole
Societe Generale|societegenerale.com|societe-generale
La Banque Postale|labanquepostale.fr|la-banque-postale
Chanel|chanel.com|chanel
Dior|dior.com|dior
SNCF|sncf.com|sncf
Transavia|transavia.com|transavia
RTE|rte-france.com|rte
EuroAPI|euroapi.com|euroapi
AG2R La Mondiale|ag2rlamondiale.fr|ag2r
Groupama|groupama.fr|groupama
Thelem|thelem-assurances.fr|thelem
Mutuaide|mutuaide.fr|mutuaide
CCR|ccr.fr|ccr
E.Leclerc|e-leclerc.com|e-leclerc
Loreal|loreal.com|loreal
Groupe Duval|groupeduval.com|groupe-duval
Betclic|betclicgroup.com|betclic
Harvest|harvest.fr|harvest
iQar|iqar.com|iqar
Esri|esri.com|esri
EOF
