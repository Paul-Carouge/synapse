#!/usr/bin/env bash
set -e
cd /home/atlas/synapse

# 1. Export fresh ChromaDB data
python3 scripts/export-data.py

# 2. Re-deploy to Vercel (only changed files)
VERCEL_TOKEN=$(grep -oP 'VERCEL_TOKEN=\K.*' /home/atlas/.hermes/.env | head -1)
vercel --token "$VERCEL_TOKEN" --prod --yes 2>&1
