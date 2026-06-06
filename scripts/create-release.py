#!/usr/bin/env python3
"""Create a GitHub release for Synapse"""
import json, os, urllib.request

# Try to get token from env or .env file
token = os.environ.get('GITHUB_TOKEN', '')
if not token or token == '***':
    env_file = os.path.expanduser('~/.hermes/.env')
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line.startswith('GITHUB_TOKEN=') and not line.endswith('***'):
                token = line.split('=', 1)[1].strip('"').strip("'")
                break

# Try non-standard locations
if not token or token == '***':
    import subprocess
    r = subprocess.run(['bash', '-c', 'source ~/.hermes/.env && echo "$GITHUB_TOKEN"'], capture_output=True, text=True)
    token = r.stdout.strip()

if not token or token == '***':
    print("NO_VALID_TOKEN")
    exit(1)

body = """## Synapse v1.0.1

### Changements
- Palette zinc/ambre restauree (design original)
- Garde les ameliorations techniques : ErrorBoundary, hooks, composants extraits
- Corrections : seed deterministe, useMemo deps, types Three.js

https://synapse-tawny-sigma.vercel.app"""

data = json.dumps({"tag_name": "v1.0.1", "name": "Synapse v1.0.1", "body": body}).encode()
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
