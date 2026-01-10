import sqlite3

conexao = sqlite3.connect('../db/financas.db')
cursor = conexao.cursor()

# usuários
cursor.execute("SELECT * FROM usuario")
usuarios = cursor.fetchall()
print("Usuários:")
for u in usuarios:
    print(u)

# categorias
cursor.execute("SELECT * FROM categoria")
categorias = cursor.fetchall()
print("\nCategorias:")
for c in categorias:
    print(c)

# transações
cursor.execute("SELECT * FROM transacao")
transacoes = cursor.fetchall()
print("\nTransações:")
for t in transacoes:
    print(t)

# metas futuras
cursor.execute("SELECT * FROM meta_futura")
metas = cursor.fetchall()
print("\nMetas Futuras:")
for m in metas:
    print(m)

conexao.close()
