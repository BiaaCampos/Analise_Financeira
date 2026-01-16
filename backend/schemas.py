from pydantic import BaseModel
from datetime import date

# TRANSACOES #
class TransacaoCreate(BaseModel):
    descricao: str
    valor: int 
    data: date
    id_usuario: int
    id_categoria: int

class TransacaoResponse(TransacaoCreate):
    id_transacao: int

    class Config:
        from_attributes = True


# USUARIO #
class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str


class UsuarioResponse(BaseModel):
    id_usuario: int
    nome: str
    email: str

    class Config:
        from_attributes = True


# METAS FUTURAS #
class MetaCreate(BaseModel):
    nome: str
    valor_alvo: int
    data_limite: date
    id_usuario: int

class MetaResponse(MetaCreate):
    id_meta: int

    class Config:
        from_attributes = True
