#!/bin/bash

cat > .gitignore <<EOF
# Node.js
node_modules/
npm-debug.log*
package-lock.json

# Base de données SQLite
db/*.db

# Fichiers temporaires / logs
*.log
logs/

# Fichiers d'environnement
.env

# Fichiers système
.DS_Store
Thumbs.db
EOF

echo ".gitignore créé."
