CREATE TABLE gallery (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title         VARCHAR(150) NOT NULL,
  caption       VARCHAR(300) NULL,
  category      ENUM('recruitment', 'workforce', 'events', 'office') NOT NULL DEFAULT 'recruitment',
  image_path    VARCHAR(255) NOT NULL,
  width         SMALLINT UNSIGNED NULL,
  height        SMALLINT UNSIGNED NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  is_published  TINYINT(1) NOT NULL DEFAULT 1,
  uploaded_by   INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_gallery_public (is_published, deleted_at, sort_order),
  KEY idx_gallery_category (category),
  CONSTRAINT fk_gallery_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Key/value store for company details and editable website content.
-- is_public controls whether the key is returned by the unauthenticated /settings/public endpoint.
CREATE TABLE website_settings (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key    VARCHAR(80) NOT NULL,
  setting_value  MEDIUMTEXT NULL,
  value_type     ENUM('string', 'text', 'json', 'boolean') NOT NULL DEFAULT 'string',
  group_name     ENUM('company', 'content', 'social', 'seo') NOT NULL DEFAULT 'company',
  is_public      TINYINT(1) NOT NULL DEFAULT 1,
  updated_by     INT UNSIGNED NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_settings_key (setting_key),
  KEY idx_settings_group (group_name),
  CONSTRAINT fk_settings_updated_by FOREIGN KEY (updated_by) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  admin_id     INT UNSIGNED NULL,
  action       VARCHAR(60) NOT NULL,
  entity_type  VARCHAR(60) NOT NULL,
  entity_id    INT UNSIGNED NULL,
  details      JSON NULL,
  ip_address   VARCHAR(45) NULL,
  user_agent   VARCHAR(255) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_admin (admin_id, created_at),
  KEY idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
