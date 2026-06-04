-- Ajout de la colonne kilométrage à la table des véhicules
ALTER TABLE public.vehicules ADD COLUMN IF NOT EXISTS kilometrage_actuel BIGINT DEFAULT 0;