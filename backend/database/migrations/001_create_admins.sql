-- Administrators who can sign in to the admin panel.
CREATE TABLE admins (
  id                   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name                 VARCHAR(120) NOT NULL,
  email                VARCHAR(190) NOT NULL,
  password_hash        VARCHAR(255) NOT NULL,
  role                 ENUM('super_admin', 'admin', 'editor') NOT NULL DEFAULT 'admin',
  is_active            TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at        DATETIME NULL,
  password_changed_at  DATETIME NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at           DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admins_email (email),
  KEY idx_admins_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
