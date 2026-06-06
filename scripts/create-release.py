#!/usr/bin/env python3
"""Create a GitHub release for Synapse"""
import json, os, urllib.request, subprocess

r = subprocess.run(['bash', '-c', 'source ~/.hermes/.env && echo "$GITHUB_TOKEN"'], capture_output=True, text=True)
token = r.stdout.strip()

if not token or token == '***':
    print("NO_VALID_TOKEN")
    exit(1)

body = "## Synapse v1.2.0 - Mobile-First\n\n### Nouveau : interface adaptative\n- BottomSheetNav : barre de navigation fixe en bas sur mobile\n- TypeFilter en bottom drawer (slide depuis le bas)\n- SearchBar en FAB icone sur mobile\n- Stats en bottom drawer avec cartes larges\n- DetailPanel en bottom sheet (85vh)\n- SearchOverlay plein ecran sur mobile\n\n### Trois breakpoints\n- Mobile (<640px) : navigation pouce, drawers, FAB\n- Tablette (640-1024px) : adaptation progressive\n- Desktop (>1024px) : layout original conserve\n\n### Equipe Orion\n- Conception mobile : Apex\n- Recherche patterns mobiles : Atlas\n\nhttps://synapse-tawny-sigma.vercel.app"

data = json.dumps({"tag_name": "v1.2.0", "name": "Synapse v1.2.0", "body": body}).encode()
req = urllib.request.Request("https://api.github.com/repos/Paul-Carouge/synapse/releases", data=data, headers={
    "Authorization": f"token {token}",
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json",
})

try:
    with urllib.request.urlopen(req) as r:
        d = json.loads(r.read())
        print("OK:", d.get("html_url", "?"))
except urllib.error.HTTPError as e:
    print(f"ERR {e.code}: {e.read().decode()[:300]}")
