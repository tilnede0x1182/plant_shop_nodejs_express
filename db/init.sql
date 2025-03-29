DROP TABLE IF EXISTS plantes;

CREATE TABLE plantes (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  prix INTEGER NOT NULL,
  categorie TEXT,
  stock INTEGER DEFAULT 0
);

INSERT INTO plantes (id, nom, description, prix, categorie, stock) VALUES
('1', 'Ficus', 'Plante verte d’intérieur', 20, 'intérieur', 5);
