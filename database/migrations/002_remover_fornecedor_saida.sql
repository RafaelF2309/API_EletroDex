USE eletrodex_db;

-- Remover foreign key de fornecedor em saida (se existir)
SET @fk_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'saida' 
      AND COLUMN_NAME = 'id_fornecedor' 
      AND REFERENCED_TABLE_NAME IS NOT NULL 
    LIMIT 1
);

SET @drop_fk_stmt = IF(@fk_name IS NOT NULL, CONCAT('ALTER TABLE saida DROP FOREIGN KEY ', @fk_name), 'SELECT 1');
PREPARE stmt FROM @drop_fk_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remover coluna id_fornecedor caso exista
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'saida' 
      AND COLUMN_NAME = 'id_fornecedor'
);

SET @drop_col_stmt = IF(@col_exists > 0, 'ALTER TABLE saida DROP COLUMN id_fornecedor', 'SELECT 1');
PREPARE stmt FROM @drop_col_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar coluna motivo caso não exista
SET @motivo_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'saida' 
      AND COLUMN_NAME = 'motivo'
);

SET @add_motivo_stmt = IF(@motivo_exists = 0, 'ALTER TABLE saida ADD COLUMN motivo VARCHAR(100) AFTER quantidade', 'SELECT 1');
PREPARE stmt FROM @add_motivo_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
