#!/usr/bin/env python3
"""Create a GitHub release for Synapse"""
import json, os, urllib.request, subprocess

r = subprocess.run(['bash', '-c', 'source ~/.hermes/.env && echo "$GITHUB_TOKEN"'], capture_output=True, text=True)
token = r.stdout.strip()
if not token or token == '***':
    print("NO_VALID_TOKEN")
    exit(1)

body = "## Synapse v1.2.1\n\n### Fix : padding du champ de recherche\n\nLes classes Tailwind `px-3` et `py-2` ne s'appliquaient pas aux elements `<input>` a cause d'un bug de `padding-inline`/`padding-block` dans Tailwind v4 + Turbopack. Solution : `style={{ padding }}` en inline. Hauteur du champ passee de 22px a 42px."

data = json.dumps({"tag_name": "v1.2.1", "name": "Synapse v1.2.1", "body": body}).encode()
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
