from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from schemas import TransacaoCreate, TransacaoResponse
from schemas import UsuarioCreate
from pydantic import BaseModel
from database import engine, SessionLocal

import models
import database
import schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Controle Financeiro API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"mensagem": "API de Controle Financeiro rodando com sucesso!"}

@app.get("/transacoes")
def listar_transacoes(usuario_id: int, db: Session = Depends(get_db)):
    transacoes = db.query(models.Transacao).filter(models.Transacao.id_usuario == usuario_id).all()
    if not transacoes:
        return []
    return transacoes

@app.get("/transacoes/{id_transacao}")
def buscar_transacao(id_transacao: int, db: Session = Depends(get_db)):
    transacao = db.query(models.Transacao).filter(models.Transacao.id_transacao == id_transacao).first()
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return transacao

@app.post("/transacoes", response_model=TransacaoResponse)
def criar_transacao(transacao: TransacaoCreate, db: Session = Depends(get_db)):
    nova_transacao = models.Transacao(**transacao.model_dump())
    db.add(nova_transacao)
    db.commit()
    db.refresh(nova_transacao)
    return nova_transacao

@app.post("/usuarios")
def cadastrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    existe = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado.")
    
    novo_usuario = models.Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha_hash=usuario.senha 
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return {"mensagem": "Usuário criado com sucesso!", "id": novo_usuario.id_usuario}

@app.post("/login")
def login(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    usuario_db = db.query(models.Usuario).filter(models.Usuario.email == usuario.email).first()
    if not usuario_db or usuario_db.senha_hash != usuario.senha:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    
    return {
        "mensagem": "Login realizado!",
        "id_usuario": usuario_db.id_usuario,
        "nome": usuario_db.nome
    }

@app.get("/metas", response_model=List[schemas.MetaResponse])
def listar_metas(usuario_id: int, db: Session = Depends(get_db)):
    metas = db.query(models.MetaFutura).filter(models.MetaFutura.id_usuario == usuario_id).all()
    return metas

@app.post("/metas", response_model=schemas.MetaResponse)
def criar_meta(meta: schemas.MetaCreate, db: Session = Depends(get_db)):
    nova_meta = models.MetaFutura(**meta.model_dump())
    db.add(nova_meta)
    db.commit()
    db.refresh(nova_meta)
    return nova_meta

@app.get("/usuarios/{usuario_id}")
def buscar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {
        "id_usuario": usuario.id_usuario,
        "nome": usuario.nome,
        "saldo_inicial": usuario.saldo_inicial
    }

class SaldoUpdate(BaseModel):
    saldo: int

@app.put("/usuarios/{usuario_id}/saldo-inicial")
def ajustar_saldo_inicial(
    usuario_id: int,
    dados: SaldoUpdate,
    db: Session = Depends(get_db)
):
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    usuario.saldo_inicial = dados.saldo
    db.commit()
    return {"mensagem": "Saldo atualizado", "novo_saldo": usuario.saldo_inicial}