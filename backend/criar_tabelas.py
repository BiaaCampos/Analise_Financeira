import sqlite3
import os

# Define o caminho do banco (sobe uma pasta e entra na /db)
db_path = '../db/financas.db'

# Garante que a pasta 'db' exista
os.makedirs(os.path.dirname(db_path), exist_ok=True)

conexao = sqlite3.connect(db_path)
cursor = conexao.cursor()

# 1. Tabela de Usuário (com saldo_inicial)
cursor.execute("""
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    saldo_inicial REAL DEFAULT 0.0
)
""")

# 2. Tabela de Categoria
cursor.execute("""
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    tipo TEXT CHECK (tipo IN ('entrada', 'saida')) NOT NULL
)
""")

# 3. Tabela de Transação
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

# 4. Tabela de Metas (com coluna descrição corrigida)
cursor.execute("""
CREATE TABLE IF NOT EXISTS meta_futura (
    id_meta INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    valor_alvo REAL NOT NULL,
    data_limite DATE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
)
""")

# --- INSERIR APENAS CATEGORIAS BÁSICAS ---
# Categorias são essenciais para o funcionamento do app desde o início
categorias_padrao = [
    ('Alimentação', 'saida'),
    ('Lazer', 'saida'),
    ('Saúde', 'saida'),
    ('Transporte', 'saida'),
    ('Moradia', 'saida'),
    ('Salário', 'entrada'),
    ('Investimentos', 'entrada'),
    ('Outros', 'entrada')
]

cursor.executemany("INSERT OR IGNORE INTO categoria (nome, tipo) VALUES (?, ?)", categorias_padrao)

conexao.commit()
conexao.close()

print(f"Estrutura do banco criada com sucesso em: {os.path.abspath(db_path)}")