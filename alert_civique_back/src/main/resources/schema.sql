-- Étape 1 : mettre à NULL les user_id non-numériques (anciens IDs anonymes String)
UPDATE lives_stream SET user_id = NULL WHERE user_id IS NOT NULL AND user_id NOT REGEXP '^[0-9]+$';

-- Étape 2 : convertir VARCHAR → BIGINT (idempotent si déjà BIGINT)
ALTER TABLE lives_stream MODIFY COLUMN user_id BIGINT NULL;

-- Étape 3 : corriger les signalements sans statut (status = NULL → PENDING)
UPDATE reports SET status = 'PENDING' WHERE status IS NULL;
