/*
  # Créer la table des lieux enregistrés

  1. Nouvelle table
    - `saved_locations`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence à auth.users)
      - `name` (text, nom du lieu)
      - `latitude` (double precision, coordonnée latitude)
      - `longitude` (double precision, coordonnée longitude)
      - `address` (text, adresse optionnelle)
      - `created_at` (timestamptz, date de création)
      - `updated_at` (timestamptz, date de mise à jour)
  
  2. Sécurité
    - Activer RLS sur la table `saved_locations`
    - Politique pour permettre aux utilisateurs de voir leurs propres lieux
    - Politique pour permettre aux utilisateurs d'ajouter leurs propres lieux
    - Politique pour permettre aux utilisateurs de modifier leurs propres lieux
    - Politique pour permettre aux utilisateurs de supprimer leurs propres lieux
  
  3. Notes importantes
    - Limite de 10 lieux par utilisateur (appliquée au niveau de l'application)
    - Le lieu de la Kaaba est géré côté client et n'est pas stocké en base
*/

CREATE TABLE IF NOT EXISTS saved_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Activer RLS
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_saved_locations_user_id ON saved_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_locations_created_at ON saved_locations(created_at DESC);

-- Politique SELECT : les utilisateurs peuvent voir leurs propres lieux
CREATE POLICY "Les utilisateurs peuvent voir leurs propres lieux"
  ON saved_locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique INSERT : les utilisateurs peuvent ajouter leurs propres lieux
CREATE POLICY "Les utilisateurs peuvent ajouter leurs propres lieux"
  ON saved_locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique UPDATE : les utilisateurs peuvent modifier leurs propres lieux
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres lieux"
  ON saved_locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique DELETE : les utilisateurs peuvent supprimer leurs propres lieux
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres lieux"
  ON saved_locations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_saved_locations_updated_at ON saved_locations;
CREATE TRIGGER update_saved_locations_updated_at
  BEFORE UPDATE ON saved_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();