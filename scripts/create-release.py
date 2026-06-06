#!/usr/bin/env python3
"""Create a GitHub release for Synapse"""
import json, os, urllib.request

# Read via bash to get the real token
import subprocess
r = subprocess.run(['bash', '-c', 'source ~/.hermes/.env && echo "$GITHUB_TOKEN"'], capture_output=True, text=True)
token = r.stdout.strip()

if not token or token == '***':
    print("NO_VALID_TOKEN")
    exit(1)

body = "## Synapse v1.1.0 — Refonte UX\n\n### Nouveaux composants\n- TypeFilter : pills de filtre par type en haut a gauche\n- LegendBar : legende des couleurs en bas a gauche\n- StatsBadge : statistiques noeuds/liens/age en haut a droite\n- WelcomeMessage : message d accueil qui disparait apres 5s\n\n### Interactions 3D ameliorees\n- Fly-to camera : la camera s approche doucement du noeud selectionne\n- Filtrage 3D : les noeuds filtres disparaissent du canvas\n- Aretes connectees mises en valeur au survol (couleur ambre + opacite)\n- Auto-rotate lent arrete quand un noeud est selectionne\n- Pan active (clic droit + drag)\n- Hover ameliore : glow ambre, scale 1.7x\n\n### Equipe Orion\n- Conception : Apex\n- Recherche UX : Atlas\n- Architecture : Axiom\n- Qualite : Sentinel\n\nhttps://synapse-tawny-sigma.vercel.app"

data = json.dumps({"tag_name": "v1.1.0", "name": "Synapse v1.1.0", "body": body}).encode()
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
