#!/usr/bin/env python3
"""Create a GitHub release for Synapse"""
import json, os, urllib.request

token = os.environ.get('GITHUB_TOKEN', '')
if not token:
    with open(os.path.expanduser('~/.hermes/.env')) as f:
        for line in f:
            if line.startswith('GITHUB_TOKEN='):
                token = line.strip().split('=', 1)[1].strip('"').strip("'")
                break

if not token:
    print("NO TOKEN")
    exit(1)

body = """## Synapse Nebula v1.0.0

Refonte complete du design system et de l'architecture.

### Design System Nebula
- Palette cosmique : Void #07070a, Abyss #0d0d14, Solar Flare #f5a623, Nova Pink, Plasma Cyan
- Typographie Inter avec tracking negatif proportionnel
- Echelle d'espacements orbitale (2px to 96px)
- Celestial Curvature radius system

### Architecture
- Composants extraits : SearchOverlay, DetailPanel
- 3 composants orphelins supprimes
- ErrorBoundary global, hooks partages

### En ligne
https://synapse-tawny-sigma.vercel.app"""

data = json.dumps({"tag_name": "v1.0.0", "name": "Synapse Nebula v1.0.0", "body": body}).encode()
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
