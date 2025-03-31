#!/bin/bash

# Nom du fichier de sortie
OUTPUT="projet.js"

# Répertoire de base
BASE_DIR="$(dirname "$0")"

# Supprimer l'ancien fichier si présent, pour éviter d'y lire pendant l'écriture
if [ -f "$OUTPUT" ]; then
  rm "$OUTPUT"
fi

# Recréer le fichier vide
touch "$OUTPUT"

# Trouver tous les fichiers .js, sauf dans node_modules et sauf le fichier projet.js lui-même
find . -type f -name "*.js" ! -path "./node_modules/*" ! -path "./$OUTPUT" | while read -r FILE; do
  REL_PATH="${FILE#./}"
  echo "\"$REL_PATH\"" >> "$OUTPUT"
  cat "$FILE" >> "$OUTPUT"
  echo -e "\n" >> "$OUTPUT"
done

echo "Tous les fichiers .js (hors node_modules et projet.js) ont été exportés dans $OUTPUT."
