import sqlite3

# O caminho que o seu erro indicou
caminho_db = r'C:\Users\bianc\OneDrive\Documentos\Analise_Financeira\db\financas.db'

try:
    conn = sqlite3.connect(caminho_db)
    cursor = conn.cursor()

    # Tenta adicionar a coluna. Se ela já existir, o script apenas avisará.
    print("Tentando atualizar a tabela de usuários...")
    cursor.execute("ALTER TABLE usuario ADD COLUMN saldo_inicial REAL DEFAULT 0.0")
    
    conn.commit()
    print("✅ SUCESSO: Coluna 'saldo_inicial' adicionada!")

except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("ℹ️ A coluna já existe no banco.")
    else:
        print(f"❌ Erro operacional: {e}")
except Exception as e:
    print(f"❌ Erro inesperado: {e}")
finally:
    if 'conn' in locals():
        conn.close()