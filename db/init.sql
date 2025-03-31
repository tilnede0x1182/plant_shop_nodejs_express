DROP TABLE IF EXISTS plantes;

CREATE TABLE plantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  description TEXT,
  prix INTEGER NOT NULL,
  categorie TEXT,
  stock INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS utilisateurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
	prenom TEXT NOT NULL,
	nom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mot_de_passe TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('visiteur', 'user', 'admin')),
  adresse TEXT,
  telephone TEXT,
  date_inscription TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actif INTEGER NOT NULL DEFAULT 1
);

INSERT INTO plantes (id, nom, description, prix, categorie, stock) VALUES
('1', 'Ficus', 'Plante verte d’intérieur', 20, 'intérieur', 5);
