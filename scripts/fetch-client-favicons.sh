#!/usr/bin/env bash
set -euo pipefail
OUT="/Users/wissemchouk/Downloads/Actisite/static/client-logos"
mkdir -p "$OUT"
while IFS='|' read -r name domain file; do
  [ -z "$name" ] && continue
  url="https://www.google.com/s2/favicons?domain=${domain}&sz=128"
  dest="${OUT}/${file}.png"
  code=$(curl -L -sS -w "%{http_code}" "$url" -o "$dest" || true)
  if [ "$code" = "200" ] && [ -s "$dest" ]; then
    echo "OK  $file"
  else
    rm -f "$dest"
    echo "MISS $file [$code]"
  fi
done <<'EOF'
BNP Paribas|bnpparibas.com|bnp-paribas
Crédit Agricole|credit-agricole.com|credit-agricole
Société Générale|societegenerale.com|societe-generale
La Banque Postale|labanquepostale.fr|la-banque-postale
Chanel|chanel.com|chanel
Christian Dior|dior.com|dior
SNCF|sncf.com|sncf
Transavia|transavia.com|transavia
RTE|rte-france.com|rte
EuroAPI|euroapi.com|euroapi
AG2R La Mondiale|ag2rlamondiale.fr|ag2r
Groupama|groupama.fr|groupama
thélem|thelem-assurances.fr|thelem
Mutuaide|mutuaide.fr|mutuaide
CCR|ccr.fr|ccr
E.Leclerc|e-leclerc.com|e-leclerc
L'Oréal|loreal.com|loreal
Groupe Duval|groupeduval.com|groupe-duval
Betclic|betclic.fr|betclic
Harvest|harvest.fr|harvest
iQar|iqar.com|iqar
Esri|esri.com|esri
EOF
