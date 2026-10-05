-- ============================================
-- Banco de Dados: EletroDex
-- Sistema de Gerenciamento de Logística
-- ============================================

CREATE DATABASE IF NOT EXISTS eletrodex_db;
USE eletrodex_db;

CREATE TABLE IF NOT EXISTS cargo (
    id_cargo INT AUTO_INCREMENT PRIMARY KEY,
    nome_cargo VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    nivel_acesso INT NOT NULL DEFAULT 1
);

INSERT IGNORE INTO cargo (nome_cargo, descricao, nivel_acesso) VALUES
('Gerente', 'Gerenciamento geral, relatórios e controle do sistema', 3),
('Estoquista', 'Responsável pelo recebimento, organização e movimentação do estoque', 2),
('Vendedor', 'Responsável pela consulta de produtos e registro de saídas/vendas', 1);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    dt_cadastro DATE NOT NULL DEFAULT (CURRENT_DATE),
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    setor ENUM('gerencia', 'estoque', 'vendas') NOT NULL,
    id_cargo INT NOT NULL,
    foto_perfil VARCHAR(255),
    FOREIGN KEY (id_cargo) REFERENCES cargo(id_cargo)
);

CREATE TABLE IF NOT EXISTS fornecedor (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    nome_fornecedor VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    cnpj VARCHAR(14) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    estoque_minimo INT NOT NULL DEFAULT 0,
    cod_barras VARCHAR(50) NOT NULL UNIQUE,
    preco DECIMAL(10,2) NOT NULL,
    imagem VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS lote (
    id_lote INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    numero_lote VARCHAR(50) NOT NULL UNIQUE,
    dt_fabricacao DATE NOT NULL,
    dt_validade DATE NOT NULL,
    quantidade_inicial INT NOT NULL,
    id_fornecedor INT NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor)
);

CREATE TABLE IF NOT EXISTS estoque (
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_lote INT NOT NULL,
    qtd_atual INT NOT NULL CHECK (qtd_atual >= 0),
    localizacao_corredor VARCHAR(20) NOT NULL,
    localizacao_prateleira VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto),
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote)
);

CREATE TABLE IF NOT EXISTS entrada (
    id_entrada INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fornecedor INT NOT NULL,
    id_produto INT NOT NULL,
    id_lote INT NOT NULL,
    data DATETIME NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    rastreamento VARCHAR(100),
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

CREATE TABLE IF NOT EXISTS saida (
    id_saida INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fornecedor INT NOT NULL,
    id_produto INT NOT NULL,
    id_lote INT NOT NULL,
    data DATETIME NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    rastreamento VARCHAR(100),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor),
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

CREATE TABLE IF NOT EXISTS ajustes (
    id_ajuste INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    id_lote INT NOT NULL,
    qtd_anterior INT NOT NULL,
    diferenca INT NOT NULL,
    qtd_nova INT NOT NULL,
    ajuste_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(200) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto),
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote)
);