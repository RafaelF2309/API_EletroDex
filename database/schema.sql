-- ============================================
-- Banco de Dados: EletroDex
-- Sistema de Gerenciamento de Logística
-- ============================================

CREATE DATABASE IF NOT EXISTS eletrodex_db;
USE eletrodex_db;

-- ============================================
-- Tabela: usuario
-- ============================================
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    dt_cadastro DATE NOT NULL DEFAULT (CURRENT_DATE),
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    setor VARCHAR(50) NOT NULL,
    cargo VARCHAR(50) NOT NULL
);

-- ============================================
-- Tabela: fornecedor
-- ============================================
CREATE TABLE IF NOT EXISTS fornecedor (
    id_fornecedor INT AUTO_INCREMENT PRIMARY KEY,
    nome_fornecedor VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    cnpj VARCHAR(14) NOT NULL UNIQUE
);

-- ============================================
-- Tabela: produto
-- ============================================
CREATE TABLE IF NOT EXISTS produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    estoque_minimo INT NOT NULL DEFAULT 0,
    cod_barras VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================
-- Tabela: lote
-- ============================================
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

-- ============================================
-- Tabela: estoque
-- ============================================
CREATE TABLE IF NOT EXISTS estoque (
    id_estoque INT AUTO_INCREMENT PRIMARY KEY,
    id_produto INT NOT NULL,
    id_lote INT NOT NULL,
    qtd_atual INT NOT NULL CHECK (qtd_atual > 0),
    localizacao_corredor VARCHAR(20) NOT NULL,
    localizacao_prateleira VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto),
    FOREIGN KEY (id_lote) REFERENCES lote(id_lote)
);

-- ============================================
-- Tabela: entrada (Movimentação de Entrada)
-- ============================================
CREATE TABLE IF NOT EXISTS entrada (
    id_entrada INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fornecedor INT NOT NULL,
    id_produto INT NOT NULL,
    data DATETIME NOT NULL,
    lote VARCHAR(50) NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    rastreamento VARCHAR(100),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

-- ============================================
-- Tabela: saida (Movimentação de Saída)
-- ============================================
CREATE TABLE IF NOT EXISTS saida (
    id_saida INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_fornecedor INT NOT NULL,
    id_produto INT NOT NULL,
    data DATETIME NOT NULL,
    lote VARCHAR(50) NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    rastreamento VARCHAR(100),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_fornecedor) REFERENCES fornecedor(id_fornecedor),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);
