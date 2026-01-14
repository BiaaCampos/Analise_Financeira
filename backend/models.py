from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    senha_hash = Column(String, nullable=False)
    saldo_inicial = Column(Float, default=0.0)

class Categoria(Base):
    __tablename__ = "categoria"

    id_categoria = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, nullable=False)
    tipo = Column(String, nullable=False)

class Transacao(Base):
    __tablename__ = "transacao"

    id_transacao = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    id_categoria = Column(Integer, ForeignKey("categoria.id_categoria"), nullable=False)
    descricao = Column(String)
    valor = Column(Float, nullable=False)
    data = Column(Date, nullable=False)

class MetaFutura(Base):
    __tablename__ = "meta_futura"

    id_meta = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    nome = Column(String, nullable=False)
    valor_alvo = Column(Float, nullable=False)
    data_limite = Column(Date)