-- Initialisation des rôles (MariaDB compatible — ignore si déjà présent)
INSERT IGNORE INTO roles (role_id, name) VALUES (1, 'ROLE_CLIENT');
INSERT IGNORE INTO roles (role_id, name) VALUES (2, 'ROLE_ADMIN');
INSERT IGNORE INTO roles (role_id, name) VALUES (3, 'ROLE_MODERATOR');
