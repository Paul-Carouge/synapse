#!/usr/bin/env python3
"""Export ChromaDB memory to JSON for Synapse web app."""
import json, chromadb

client = chromadb.PersistentClient(path='/opt/data/.orion/memory/')
entries = []
for col in client.list_collections():
    data = col.get()
    if data and data['ids']:
        for i in range(len(data['ids'])):
            entries.append({
                'id': data['ids'][i],
                'text': (data['documents'][i] if data['documents'] else '')[:500],
                'metadata': data['metadatas'][i] if data['metadatas'] else {},
            })

out = '/home/atlas/synapse/public/data.json'
with open(out, 'w') as f:
    json.dump(entries, f, ensure_ascii=False, indent=2)

print(f"Exported {len(entries)} entries to {out}")
