import sqlite3
import os

conexao = sqlite3.connect('../db/financas.db')
cursor = conexao.cursor()

# Tabelas

cursor.execute("""
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    tipo TEXT CHECK (tipo IN ('entrada', 'saida')) NOT NULL
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS transacao (
    id_transacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    descricao TEXT,
    valor REAL NOT NULL,
    data DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS meta_futura (
    id_meta INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    nome TEXT NOT NULL,
    valor_alvo REAL NOT NULL,
    data_limite DATE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
)
""")

# Inserir dados

cursor.execute("""
INSERT OR IGNORE INTO usuario (id_usuario, nome, email, senha_hash)
VALUES (1, 'Bianca', 'bianca@email.com', 'hash123')
""")

categorias = [
    ('Alimentação', 'saida'),
    ('Cartão de Crédito', 'saida'),
    ('Aluguel / Parcela de Financiamento', 'saida'),
    ('Salário Mensal', 'entrada')
]

cursor.executemany("INSERT OR IGNORE INTO categoria (nome, tipo) VALUES (?, ?)", categorias)

transacoes = [
    (1, 1, 'Almoço restaurante', 45.50, '2026-01-05'),
    (1, 1, 'Supermercado', 230.00, '2026-01-03'),
    (1, 2, 'Fatura cartão', 1200.00, '2026-01-01'),
    (1, 3, 'Aluguel apartamento', 1500.00, '2026-01-01'),
    (1, 4, 'Salário Janeiro', 5000.00, '2026-01-01')
]
cursor.executemany("""
INSERT OR IGNORE INTO transacao (id_usuario, id_categoria, descricao, valor, data)
VALUES (?, ?, ?, ?, ?)
""", transacoes)

metas = [
    (1, 'Viagem Europa', 'Economizar para viagem de 2 semanas', 10000.00, '2026-12-31'),
    (1, 'Comprar Notebook', 'Trocar notebook antigo por um novo', 6000.00, '2026-06-30'),
    (1, 'Reserva de Emergência', 'Guardar dinheiro para imprevistos', 5000.00, '2026-09-30')
]
cursor.executemany("""
INSERT OR IGNORE INTO meta_futura (id_usuario, nome, descricao, valor_alvo, data_limite)
VALUES (?, ?, ?, ?, ?)
""", metas)

conexao.commit()
conexao.close()

print("Banco simplificado criado e populado com sucesso em db/financas.db!")
